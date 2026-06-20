// src/routes/group.routes.ts
import { Router } from 'express';
import { requireAuth, syncUserMiddleware } from '../middlewares/auth.middleware';
import { listGroups, createGroup, updateGroup, deleteGroup, getGroupRoster, resetStudentPin, generateParentInvite } from '../controllers/group.controller';

const router = Router();
router.use(requireAuth(), syncUserMiddleware);

router.get('/', listGroups);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

router.get('/:id/roster', getGroupRoster);
router.post('/:id/students/:studentId/reset-pin', resetStudentPin);
router.post('/:id/students/:studentId/parent-invite', generateParentInvite);

export default router;
