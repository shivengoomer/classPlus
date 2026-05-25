// src/hooks/useJobSocket.ts
import { useEffect, useRef } from 'react';
import { useJobStore } from '@/store/jobStore';
import { useAssignmentStore } from '@/store/assignmentStore';
import { simulateJobCompletion } from '@/lib/api';

export function useJobSocket(jobId: string | null) {
  const setStatus = useJobStore((state) => state.setStatus);
  const setProgress = useJobStore((state) => state.setProgress);
  const setDone = useJobStore((state) => state.setDone);
  const addAssignment = useAssignmentStore((state) => state.addAssignment);
  const setAssignments = useAssignmentStore((state) => state.setAssignments);

  const socketRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const currentJobId: string = jobId;

    let isSimulated = false;

    // Reset store for the new job
    useJobStore.getState().reset();
    useJobStore.getState().setJobId(currentJobId);

    function connect() {
      // If we are simulating because websocket failed or we are in mock mode
      if (currentJobId.startsWith('job-')) {
        runSimulation();
        return;
      }

      try {
        const ws = new WebSocket('ws://localhost:4000');
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
                setProgress(0, 'Queued...');
                break;
              case 'job:processing':
                setStatus('processing');
                setProgress(10, 'Processing started...');
                break;
              case 'job:progress':
                setStatus('processing');
                setProgress(data.progress, data.message || 'Generating...');
                break;
              case 'job:done':
                setStatus('done');
                setProgress(100, 'Done!');
                setDone(data.assignmentId);
                // Refresh list
                import('@/lib/api').then((api) => {
                  api.listAssignments().then((list) => {
                    setAssignments(list);
                  });
                });
                break;
              case 'job:failed':
                setStatus('failed');
                setProgress(0, data.error || 'Generation failed');
                break;
            }
          } catch (e) {
            console.error('Error parsing socket message:', e);
          }
        };

        ws.onerror = (err) => {
          console.warn('WebSocket error, falling back to retry/simulation:', err);
          ws.close();
        };

        ws.onclose = () => {
          if (retryCountRef.current < maxRetries) {
            const delay = Math.pow(2, retryCountRef.current) * 1000;
            console.log(`WebSocket closed. Retrying in ${delay}ms...`);
            retryCountRef.current += 1;
            timeoutRef.current = setTimeout(connect, delay);
          } else {
            console.log('Max WebSocket retries reached. Falling back to local simulation.');
            runSimulation();
          }
        };
      } catch (err) {
        console.error('Error establishing WebSocket:', err);
        runSimulation();
      }
    }

    function runSimulation() {
      if (isSimulated) return;
      isSimulated = true;
      console.log('Starting client-side job simulation...');
      
      simulateJobCompletion(
        currentJobId, 
        (progress, msg, status) => {
          setStatus(status as 'idle' | 'queued' | 'processing' | 'done' | 'failed');
          setProgress(progress, msg);
        },
        (completedAssignment) => {
          // Update global assignment store
          const currentList = useAssignmentStore.getState().assignments;
          const exists = currentList.some(a => a._id === completedAssignment._id);
          if (exists) {
            const updated = currentList.map(a => a._id === completedAssignment._id ? completedAssignment : a);
            setAssignments(updated);
          } else {
            addAssignment(completedAssignment);
          }
          setDone(completedAssignment._id);
        }
      );
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
  }, [jobId, setStatus, setProgress, setDone, addAssignment, setAssignments]);
}
