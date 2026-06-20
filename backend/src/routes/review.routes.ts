// src/routes/review.routes.ts
import { Router } from 'express';
import { requireStudentAuth } from '../middlewares/auth.middleware';
import { listDueReviews, generateReviewQuestion, submitReview } from '../controllers/review.controller';

const router = Router();

// Secure with student-facing auth
router.use(requireStudentAuth());

router.get('/due', listDueReviews);
router.post('/:reviewId/generate', generateReviewQuestion);
router.post('/:reviewId/submit', submitReview);

export default router;
