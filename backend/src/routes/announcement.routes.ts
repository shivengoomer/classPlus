import { Router } from 'express';
import { requireAuth, syncUserMiddleware, requireEitherAuth } from '../middlewares/auth.middleware';
import { listAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcement.controller';

const router = Router();

router.get('/group/:groupId', requireEitherAuth, listAnnouncements);
router.post('/', requireAuth(), syncUserMiddleware, createAnnouncement);
router.delete('/:id', requireAuth(), syncUserMiddleware, deleteAnnouncement);

export default router;
