import { Router } from 'express';
import { 
  listNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  clearAllNotifications 
} from '../controllers/notification.controller';
import { requireAuth, syncUserMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Protect all routes
router.use(requireAuth(), syncUserMiddleware);

router.get('/', listNotifications);
router.patch('/mark-all-read', markAllAsRead);
router.delete('/clear-all', clearAllNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
