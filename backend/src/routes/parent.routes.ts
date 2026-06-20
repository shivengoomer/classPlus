// src/routes/parent.routes.ts
import { Router } from 'express';
import { requireAuth, syncUserMiddleware } from '../middlewares/auth.middleware';
import { linkChildToParent, listLinkedChildren, getParentChildDashboard } from '../controllers/parent.controller';

const router = Router();

// Secure parent portal routes
router.use(requireAuth(), syncUserMiddleware);

router.post('/link', linkChildToParent);
router.get('/children', listLinkedChildren);
router.get('/children/:studentId/dashboard', getParentChildDashboard);

export default router;
