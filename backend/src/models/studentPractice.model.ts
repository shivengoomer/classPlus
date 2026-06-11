import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentPractice extends Document {
  studentEmail: string;
  studentName: string;
  classCode?: string;
  subject: string;
  grade: string;
  topic: string;
  questions: any[];
  answers?: any[];
  score?: number;
  totalMarks?: number;
  feedback?: string;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentPracticeSchema = new Schema(
  {
    studentEmail: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    classCode: { type: String },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    topic: { type: String, required: true },
    questions: { type: Array, required: true },
    answers: { type: Array },
    score: { type: Number },
    totalMarks: { type: Number },
    feedback: { type: String },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

export const StudentPractice = mongoose.model<IStudentPractice>('StudentPractice', StudentPracticeSchema);
