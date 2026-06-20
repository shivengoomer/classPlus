// src/routes/superadmin.routes.ts
import { Router } from 'express';
import {
  listInstitutions,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getInstitutionDetail,
  createInstitutionAdmin,
  deleteInstitutionAdmin,
} from '../controllers/superadmin.controller';

const router = Router();

// Secure Super Admin endpoints via static header token checking
router.use((req, res, next) => {
  const token = req.headers['x-superadmin-token'];
  const expectedToken = process.env.SUPERADMIN_SECRET_KEY;

  if (!token || token !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or missing Super Admin secret token.' });
  }
  next();
});

router.get('/institutions', listInstitutions);
router.post('/institutions', createInstitution);
router.put('/institutions/:id', updateInstitution);
router.delete('/institutions/:id', deleteInstitution);
router.get('/institutions/:id/detail', getInstitutionDetail);
router.post('/institutions/:id/admins', createInstitutionAdmin);
router.delete('/institutions/:id/admins/:adminId', deleteInstitutionAdmin);

export default router;
