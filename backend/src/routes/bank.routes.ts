// src/routes/bank.routes.ts
import { Router } from 'express';
import { requireAuth, syncUserMiddleware } from '../middlewares/auth.middleware';
import { saveQuestionToBank, listBankQuestions, deleteQuestionFromBank } from '../controllers/bank.controller';

const router = Router();

// Secure item bank routes
router.use(requireAuth(), syncUserMiddleware);

router.post('/', saveQuestionToBank);
router.get('/', listBankQuestions);
router.delete('/:id', deleteQuestionFromBank);

export default router;
