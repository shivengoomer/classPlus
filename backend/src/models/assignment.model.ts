// src/models/assignment.model.ts
// mongoose schema for assignments — matches what the frontend expects

import mongoose, { Schema, Document } from 'mongoose';

const RubricCriteriaSchema = new Schema({
  label: { type: String, required: true },
  marks: { type: Number, required: true },
  description: { type: String, required: true },
}, { _id: false });

// question inside a section
const QuestionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ['mcq', 'short', 'long', 'truefalse', 'fillblank'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging'],
    required: true,
  },
  marks: { type: Number, required: true },
  options: [{ type: String }], // only for mcq and truefalse
  answer: { type: String },
  conceptTag: { type: String }, // topic/concept label for progress tracking
  rubric: [RubricCriteriaSchema], // detailed marking rubric
}, { _id: false });


// section of the paper (Section A, B, C...)
const SectionSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  questions: [QuestionSchema],
}, { _id: false });

// answer key entry
const AnswerKeySchema = new Schema({
  questionId: { type: String, required: true },
  answer: { type: String, required: true },
}, { _id: false });

// the AI-generated result
const ResultSchema = new Schema({
  aiMessage: { type: String },
  schoolName: { type: String },
  subject: { type: String },
  grade: { type: String },
  timeAllowed: { type: String },
  totalMarks: { type: Number },
  sections: [SectionSchema],
  answerKey: [AnswerKeySchema],
  generatedAt: { type: String },
}, { _id: false });

// question row config (what the teacher selected in the form)
const QuestionRowSchema = new Schema({
  type: {
    type: String,
    enum: ['mcq', 'short', 'long', 'truefalse', 'fillblank'],
    required: true,
  },
  count: { type: Number, required: true },
  marks: { type: Number, required: true },
}, { _id: false });

// main assignment document
export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionRows: { type: string; count: number; marks: number }[];
  totalMarks: number;
  additionalInstructions?: string;
  fileUrl?: string;
  pdfUrl?: string;
  filePath?: string; // temp path for uploaded file
  status: 'pending' | 'processing' | 'done' | 'failed';
  jobId?: string;
  result?: any;
  userId?: string;
  institutionId?: mongoose.Types.ObjectId;
  parentAssignmentId?: string; // links difficulty variant to original
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    dueDate: { type: String, required: true },
    questionRows: [QuestionRowSchema],
    totalMarks: { type: Number, required: true },
    additionalInstructions: { type: String },
    fileUrl: { type: String },
    pdfUrl: { type: String },
    filePath: { type: String }, // local path to uploaded file for worker to parse
    status: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
    result: ResultSchema,
    userId: { type: String },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    parentAssignmentId: { type: String }, // links difficulty variant to original
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
  }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
