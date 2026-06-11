// src/routes/assigned.routes.ts
import { Router } from 'express';
import { requireAuth, syncUserMiddleware } from '../middlewares/auth.middleware';
import {
  listAssigned,
  createAssigned,
  getAssigned,
  deleteAssigned,
  getAssignedSubmissions,
  updateStudentSubmission,
} from '../controllers/assigned.controller';

const router = Router();
router.use(requireAuth(), syncUserMiddleware);

router.get('/', listAssigned);
router.post('/', createAssigned);
router.get('/:id', getAssigned);
router.delete('/:id', deleteAssigned);
router.get('/:id/submissions', getAssignedSubmissions);
router.put('/:id/submissions/:studentName', updateStudentSubmission);

export default router;
