// src/app.ts
// express application setup with middleware and routes

import express from 'express';
import cors from 'cors';
import path from 'path';
import { clerkMiddleware } from '@clerk/express';
import assignmentRoutes from './routes/assignment.routes';
import libraryRoutes from './routes/library.routes';
import notificationRoutes from './routes/notification.routes';
import userRoutes from './routes/user.routes';
import rubricRoutes from './routes/rubric.routes';
import templateRoutes from './routes/template.routes';
import groupRoutes from './routes/group.routes';
import assignedRoutes from './routes/assigned.routes';
import studentRoutes from './routes/student.routes';
import reportRoutes from './routes/report.routes';
import adminRoutes from './routes/admin.routes';
import announcementRoutes from './routes/announcement.routes';
import superadminRoutes from './routes/superadmin.routes';
import parentRoutes from './routes/parent.routes';
import bankRoutes from './routes/bank.routes';
import reviewRoutes from './routes/review.routes';

const app = express();

// serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// middleware
app.use(cors({
  origin: true, // Allow all origins dynamically in development
  credentials: true,
}));
import { blockParentMutations } from './middlewares/auth.middleware';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());
app.use(blockParentMutations);

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// superadmin routes under /api/superadmin
app.use('/api/superadmin', superadminRoutes);

// admin routes under /api/admin
app.use('/api/admin', adminRoutes);

// announcement routes under /api/announcements
app.use('/api/announcements', announcementRoutes);

// assignment routes under /api/assignments
app.use('/api/assignments', assignmentRoutes);

// library routes under /api/library
app.use('/api/library', libraryRoutes);

// notification routes under /api/notifications
app.use('/api/notifications', notificationRoutes);

// user routes under /api/users
app.use('/api/users', userRoutes);

// rubric routes under /api/rubrics
app.use('/api/rubrics', rubricRoutes);

// template routes under /api/templates
app.use('/api/templates', templateRoutes);

// group routes under /api/groups
app.use('/api/groups', groupRoutes);

// assigned assessment routes under /api/assigned
app.use('/api/assigned', assignedRoutes);

// student-facing routes (no auth) under /api/student
app.use('/api/student', studentRoutes);
app.use('/api/student/reviews', reviewRoutes);

// parent portal routes
app.use('/api/parent', parentRoutes);

// item bank routes
app.use('/api/bank', bankRoutes);

// report/analytics routes under /api/reports
app.use('/api/reports', reportRoutes);

// global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
