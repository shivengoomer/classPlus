// src/routes/student.routes.ts
// All student-facing routes — NO Clerk auth required
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

// No auth middleware — students authenticate via Email + 4-digit PIN
router.post('/login/verify', verifyStudentSession);
router.post('/register', studentRegister);
router.post('/login', studentLogin);
router.post('/join-class', joinClassGroup);
router.get('/session', getStudentSession);

router.get('/assignment/:assignedId', getStudentAssignment);
router.post('/submit/:assignedId', submitStudentAnswers);
router.post('/upload/:assignedId', upload.single('paper'), uploadStudentPaper);
router.get('/results/:assignedId', getStudentResults);
router.post('/tutor/chat', studentTutorChat);

// AI Practice Lab routes
router.post('/practice/generate', generatePracticeWorksheet);
router.post('/practice/submit/:practiceId', submitPracticeWorksheet);
router.get('/practice/history', getPracticeHistory);

// Syllabus mapping / explore route
router.post('/syllabus/explore', exploreCbsesyllabus);

export default router;


