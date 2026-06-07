import { Router } from 'express';
import { generateRubric } from '../controllers/rubric.controller';
import { requireAuth, syncUserMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Require authentication for generating rubrics
router.use(requireAuth(), syncUserMiddleware);

router.post('/generate', generateRubric);

export default router;
