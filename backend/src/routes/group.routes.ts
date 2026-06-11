// src/routes/group.routes.ts
import { Router } from 'express';
import { requireAuth, syncUserMiddleware } from '../middlewares/auth.middleware';
import { listGroups, createGroup, updateGroup, deleteGroup } from '../controllers/group.controller';

const router = Router();
router.use(requireAuth(), syncUserMiddleware);

router.get('/', listGroups);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

export default router;
