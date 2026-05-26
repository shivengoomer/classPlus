// src/server.ts
// main entry point — starts everything up

import http from 'http';
import { validateEnv, env } from './config/env';
import { connectDB } from './config/db';
import { setupWebSocket } from './websocket/socket';
import { startWorker } from './workers/assignment.worker';
import app from './app';
import { log } from './utils/logger';

async function main() {
  // step 1: validate env vars
  validateEnv();

  // step 2: connect to MongoDB Atlas
  await connectDB();

  // step 3: create HTTP server from express app
  const server = http.createServer(app);

  // step 4: attach WebSocket server to the same HTTP server
  // so ws://localhost:4000 works alongside http://localhost:4000/api
  setupWebSocket(server);

  // step 5: start the BullMQ worker
  startWorker();

  // step 6: start listening
  server.listen(env.PORT, () => {
    log(`🚀 Server running on http://localhost:${env.PORT}`);
    log(`📡 WebSocket ready on ws://localhost:${env.PORT}`);
    log(`🔗 API available at http://localhost:${env.PORT}/api`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
