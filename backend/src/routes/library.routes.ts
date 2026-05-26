// src/routes/library.routes.ts
// defines all library-related REST API routes

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  listItems,
  uploadItem,
  createFolder,
  deleteItem,
} from '../controllers/library.controller';

const router = Router();

// make sure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// multer configuration for file uploads (PDF/DOC/DOCX)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not supported. Use PDF or Word documents.`));
    }
  },
});

// routes
router.get('/', listItems);
router.post('/', upload.single('file'), uploadItem);
router.post('/folder', createFolder);
router.delete('/:id', deleteItem);

export default router;
