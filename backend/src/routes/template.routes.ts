import { Router } from 'express';
import { listTemplates, createTemplate, deleteTemplate } from '../controllers/template.controller';
import { requireAuth, syncUserMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Require authentication for templates
router.use(requireAuth(), syncUserMiddleware);

router.get('/', listTemplates);
router.post('/', createTemplate);
router.delete('/:id', deleteTemplate);

export default router;
