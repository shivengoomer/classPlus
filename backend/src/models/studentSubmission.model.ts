// src/models/studentSubmission.model.ts
// Mongoose schema for student test submissions within assigned assignments

import mongoose, { Schema, Document } from 'mongoose';

const AnswerEntrySchema = new Schema({
  questionId: { type: String, required: true },
  answer: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  marks: { type: Number, default: 0 },
  aiFeedback: { type: String },
}, { _id: false });

export interface IAnswerEntry {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  marks: number;
  aiFeedback?: string;
}

export interface IStudentSubmission extends Document {
  assignedAssignmentId: mongoose.Types.ObjectId;
  studentName: string;
  answers: IAnswerEntry[];
  totalScore: number;
  totalMarks: number;
  startedAt: Date | null;
  submittedAt: Date | null;
  autoSubmitted: boolean;
  timerJobId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSubmissionSchema = new Schema(
  {
    assignedAssignmentId: { type: Schema.Types.ObjectId, ref: 'AssignedAssignment', required: true },
    studentName: { type: String, required: true },
    answers: [AnswerEntrySchema],
    totalScore: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    startedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    autoSubmitted: { type: Boolean, default: false },
    timerJobId: { type: String, default: null },
  },
  { timestamps: true }
);

// Compound index: one submission per student per assigned assignment
StudentSubmissionSchema.index({ assignedAssignmentId: 1, studentName: 1 }, { unique: true });

export const StudentSubmission = mongoose.model<IStudentSubmission>(
  'StudentSubmission',
  StudentSubmissionSchema
);
