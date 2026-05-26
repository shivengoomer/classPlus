// src/websocket/socket.ts
// native WebSocket server using 'ws' package
// the frontend connects via new WebSocket('ws://localhost:4000')
// and sends { type: 'subscribe', jobId: '...' } to subscribe to job updates

import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { log } from '../utils/logger';

// track which clients are listening to which jobId
const jobSubscriptions = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer;

export function setupWebSocket(server: http.Server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    log('New WebSocket client connected');

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        // client subscribes to a specific job's updates
        if (data.type === 'subscribe' && data.jobId) {
          const jobId = data.jobId as string;

          if (!jobSubscriptions.has(jobId)) {
            jobSubscriptions.set(jobId, new Set());
          }
          jobSubscriptions.get(jobId)!.add(ws);

          log(`Client subscribed to job: ${jobId}`);
        }
      } catch {
        // ignore invalid messages
      }
    });

    ws.on('close', () => {
      // remove this client from all subscriptions
      for (const [jobId, clients] of jobSubscriptions.entries()) {
        clients.delete(ws);
        if (clients.size === 0) {
          jobSubscriptions.delete(jobId);
        }
      }
      log('WebSocket client disconnected');
    });
  });

  log('WebSocket server ready');
}

// broadcast a message to all clients subscribed to a specific jobId
export function broadcastToJob(jobId: string, message: Record<string, any>) {
  const clients = jobSubscriptions.get(jobId);
  if (!clients || clients.size === 0) return;

  const payload = JSON.stringify({ ...message, jobId });

  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}
