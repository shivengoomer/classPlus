// src/routes/assignment.routes.ts
// defines all assignment REST API routes

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createAssignment,
  listAssignments,
  getAssignment,
  deleteAssignment,
  regenerateAssignment,
  exportPDF,
  regenerateWithDifficulty,
} from '../controllers/assignment.controller';
import { requireAuth, syncUserMiddleware, checkCredits } from '../middlewares/auth.middleware';

const router = Router();

// make sure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// multer config for file uploads (PDF/DOCX)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    // add timestamp to avoid name collisions
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not supported. Use PDF or DOCX.`));
    }
  },
});

// Public endpoints (for downloads via browser redirects)
router.get('/:id/export-pdf', exportPDF);

// Protected endpoints
router.use(requireAuth(), syncUserMiddleware);

router.post('/', upload.single('file'), checkCredits, createAssignment);
router.get('/', listAssignments);
router.get('/:id', getAssignment);
router.delete('/:id', deleteAssignment);
router.post('/:id/regenerate', checkCredits, regenerateAssignment);
router.post('/:id/regenerate-difficulty', checkCredits, regenerateWithDifficulty);

export default router;
