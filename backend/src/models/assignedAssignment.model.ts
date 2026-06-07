// src/models/assignedAssignment.model.ts
// Mongoose schema for assignments assigned to class groups

import mongoose, { Schema, Document } from 'mongoose';

// Misconception sub-schemas
const MisconceptionSchema = new Schema({
  label: { type: String, required: true },
  affectedCount: { type: Number, required: true },
  explanation: { type: String, required: true },
}, { _id: false });

const QuestionMisconceptionSchema = new Schema({
  questionId: { type: String, required: true },
  misconceptions: [MisconceptionSchema],
}, { _id: false });

// Hint log sub-schema
const HintLogEntrySchema = new Schema({
  studentName: { type: String, required: true },
  questionId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

export interface IMisconception {
  label: string;
  affectedCount: number;
  explanation: string;
}

export interface IQuestionMisconception {
  questionId: string;
  misconceptions: IMisconception[];
}

export interface IHintLogEntry {
  studentName: string;
  questionId: string;
  timestamp: Date;
}

export interface IAssignedAssignment extends Document {
  assignmentId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  assignedDate: Date;
  dueDate: string;
  hintsEnabled: boolean;
  durationMinutes: number | null;
  misconceptionAnalysis: IQuestionMisconception[];
  hintLog: IHintLogEntry[];
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignedAssignmentSchema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    assignedDate: { type: Date, default: Date.now },
    dueDate: { type: String, required: true },
    hintsEnabled: { type: Boolean, default: false },
    durationMinutes: { type: Number, default: null },
    misconceptionAnalysis: [QuestionMisconceptionSchema],
    hintLog: [HintLogEntrySchema],
    userId: { type: String },
  },
  { timestamps: true }
);

export const AssignedAssignment = mongoose.model<IAssignedAssignment>(
  'AssignedAssignment',
  AssignedAssignmentSchema
);
