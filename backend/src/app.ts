// src/app.ts
// express application setup with middleware and routes

import express from 'express';
import cors from 'cors';
import assignmentRoutes from './routes/assignment.routes';
import libraryRoutes from './routes/library.routes';

const app = express();

// middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Next.js dev server
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// assignment routes under /api/assignments
app.use('/api/assignments', assignmentRoutes);

// library routes under /api/library
app.use('/api/library', libraryRoutes);

// global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
