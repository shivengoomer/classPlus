// src/hooks/useJobSocket.ts
import { useEffect, useRef } from 'react';
import { useJobStore } from '@/store/jobStore';
import { useAssignmentStore } from '@/store/assignmentStore';

export function useJobSocket(jobId: string | null) {
  const setStatus = useJobStore((state) => state.setStatus);
  const setProgress = useJobStore((state) => state.setProgress);
  const setDone = useJobStore((state) => state.setDone);
  const setAssignments = useAssignmentStore((state) => state.setAssignments);

  const socketRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const currentJobId: string = jobId;

    // Reset store for the new job
    useJobStore.getState().reset();
    useJobStore.getState().setJobId(currentJobId);

    function connect() {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          console.log('Connected to WebSocket server');
          retryCountRef.current = 0;
          ws.send(JSON.stringify({ type: 'subscribe', jobId: currentJobId }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.jobId !== currentJobId) return;

            switch (data.type) {
              case 'job:queued':
                setStatus('queued');
                setProgress(0, 'Queued...', data.stage || 'queued');
                break;
              case 'job:processing':
                setStatus('processing');
                setProgress(10, 'Processing started...', data.stage || 'parsing');
                break;
              case 'job:progress':
                setStatus('processing');
                setProgress(data.progress, data.message || 'Generating...', data.stage, data.sectionIndex, data.totalSections);
                break;
              case 'job:done':
                setStatus('done');
                setProgress(100, 'Done!', 'completed');
                setDone(data.assignmentId);
                // Refresh list and notifications from backend
                import('@/lib/api').then((api) => {
                  api.listAssignments().then((list) => {
                    setAssignments(list);
                  });
                });
                import('@/store/notificationStore').then((store) => {
                  store.useNotificationStore.getState().fetchNotifications();
                });
                break;
              case 'job:failed':
                setStatus('failed');
                setProgress(0, data.error || 'Generation failed', 'failed');
                break;
            }
          } catch (e) {
            console.error('Error parsing socket message:', e);
          }
        };

        ws.onerror = (err) => {
          console.warn('WebSocket error:', err);
          ws.close();
        };

        ws.onclose = () => {
          if (retryCountRef.current < maxRetries) {
            const delay = Math.pow(2, retryCountRef.current) * 1000;
            console.log(`WebSocket closed. Retrying in ${delay}ms...`);
            retryCountRef.current += 1;
            timeoutRef.current = setTimeout(connect, delay);
          } else {
            console.log('Max WebSocket retries reached. Connection failed.');
            setStatus('failed');
            setProgress(0, 'Unable to establish real-time connection with server.');
          }
        };
      } catch (err) {
        console.error('Error establishing WebSocket:', err);
        setStatus('failed');
        setProgress(0, 'Failed to connect to real-time update socket.');
      }
    }

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [jobId, setStatus, setProgress, setDone, setAssignments]);
}
