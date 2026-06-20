// src/routes/student.routes.ts
// All student-facing routes
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  verifyStudentSession,
  studentRegister,
  studentLogin,
  joinClassGroup,
  getStudentSession,
  getStudentAssignment,
  submitStudentAnswers,
  uploadStudentPaper,
  getStudentResults,
  studentTutorChat,
  generatePracticeWorksheet,
  submitPracticeWorksheet,
  getPracticeHistory,
  exploreCbsesyllabus,
} from '../controllers/student.controller';
import { requireStudentAuth } from '../middlewares/auth.middleware';

const router = Router();

// multer config for student paper uploads (images + PDF)
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `student-${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error(`File type ${ext} not supported`));
  },
});

// Authentication endpoints (public)
router.post('/login/verify', verifyStudentSession);
router.post('/register', studentRegister);
router.post('/login', studentLogin);

// Protected endpoints (require student JWT token)
router.post('/join-class', requireStudentAuth(), joinClassGroup);
router.get('/session', requireStudentAuth(), getStudentSession);
router.get('/assignment/:assignedId', requireStudentAuth(), getStudentAssignment);
router.post('/submit/:assignedId', requireStudentAuth(), submitStudentAnswers);
router.post('/upload/:assignedId', requireStudentAuth(), upload.single('paper'), uploadStudentPaper);
router.get('/results/:assignedId', requireStudentAuth(), getStudentResults);
router.post('/tutor/chat', requireStudentAuth(), studentTutorChat);

// AI Practice Lab routes
router.post('/practice/generate', requireStudentAuth(), generatePracticeWorksheet);
router.post('/practice/submit/:practiceId', requireStudentAuth(), submitPracticeWorksheet);
router.get('/practice/history', requireStudentAuth(), getPracticeHistory);

// Syllabus mapping / explore route
router.post('/syllabus/explore', requireStudentAuth(), exploreCbsesyllabus);

export default router;


