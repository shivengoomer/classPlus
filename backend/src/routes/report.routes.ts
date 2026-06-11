// src/routes/report.routes.ts
import { Router } from 'express';
import { requireAuth, syncUserMiddleware } from '../middlewares/auth.middleware';
import { listStudentReports, getDetailedStudentReport } from '../controllers/report.controller';

const router = Router();
router.use(requireAuth(), syncUserMiddleware);

router.get('/students', listStudentReports);
router.get('/student/:email', getDetailedStudentReport);

export default router;
