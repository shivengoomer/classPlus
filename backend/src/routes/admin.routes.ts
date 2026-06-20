import { Router } from 'express';
import { requireAdminAuth } from '../middlewares/auth.middleware';
import { getStats, listTeachers, addTeacher, listAllGroups, getAuditLogs, claimAdminRole, registerSchool, loginAdmin } from '../controllers/admin.controller';

const router = Router();

// Public routes for self-onboarding, claim, and credentials login
router.post('/login', loginAdmin);
router.post('/claim', claimAdminRole);
router.post('/register-school', registerSchool);

// Secure all subsequent endpoints strictly via local Admin JWT authorization
router.use(requireAdminAuth);

router.get('/stats', getStats);
router.get('/teachers', listTeachers);
router.post('/teachers', addTeacher);
router.get('/groups', listAllGroups);
router.get('/audit-logs', getAuditLogs);

export default router;
