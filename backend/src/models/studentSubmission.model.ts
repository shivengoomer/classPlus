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
  studentId?: mongoose.Types.ObjectId;
  studentName: string;
  answers: IAnswerEntry[];
  totalScore: number;
  totalMarks: number;
  status: 'grading' | 'graded' | 'failed';
  startedAt: Date | null;
  submittedAt: Date | null;
  autoSubmitted: boolean;
  timerJobId: string | null;
  similarityScore?: number;
  similarityFlaggedWith?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentSubmissionSchema = new Schema(
  {
    assignedAssignmentId: { type: Schema.Types.ObjectId, ref: 'AssignedAssignment', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentCredential', index: true },
    studentName: { type: String, required: true },
    answers: [AnswerEntrySchema],
    totalScore: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    status: { type: String, enum: ['grading', 'graded', 'failed'], default: 'graded' },
    startedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    autoSubmitted: { type: Boolean, default: false },
    timerJobId: { type: String, default: null },
    similarityScore: { type: Number, default: 0 },
    similarityFlaggedWith: [{ type: Schema.Types.ObjectId, ref: 'StudentSubmission' }],
  },
  { timestamps: true }
);

// Compound indexes: one submission per student per assigned assignment.
// We index (assignedAssignmentId, studentId) uniquely for modern registered students,
// and fall back to (assignedAssignmentId, studentName) uniquely for legacy or unregistered student names.
StudentSubmissionSchema.index(
  { assignedAssignmentId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { studentId: { $exists: true } } }
);
StudentSubmissionSchema.index(
  { assignedAssignmentId: 1, studentName: 1 },
  { unique: true, partialFilterExpression: { studentId: { $exists: false } } }
);

export const StudentSubmission = mongoose.model<IStudentSubmission>(
  'StudentSubmission',
  StudentSubmissionSchema
);
