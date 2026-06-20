import mongoose, { Schema, Document } from 'mongoose';

export interface IBankQuestion extends Document {
  questionText: string;
  type: 'mcq' | 'short' | 'long' | 'truefalse' | 'fillblank';
  options?: string[]; // Options if MCQ
  correctAnswer?: string;
  subject: string;
  grade: string;
  chapter?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bloomLevel?: string;
  tags: string[];
  createdBy: string; // Clerk User ID
  usageCount: number;
  sourceAssessmentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BankQuestionSchema = new Schema(
  {
    questionText: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['mcq', 'short', 'long', 'truefalse', 'fillblank'],
    },
    options: [{ type: String }],
    correctAnswer: { type: String },
    subject: { type: String, required: true, index: true },
    grade: { type: String, required: true, index: true },
    chapter: { type: String, index: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    bloomLevel: { type: String },
    tags: [{ type: String, index: true }],
    createdBy: { type: String, required: true, index: true },
    usageCount: { type: Number, default: 0 },
    sourceAssessmentId: { type: Schema.Types.ObjectId, ref: 'Assignment' },
  },
  { timestamps: true }
);

export const BankQuestion = mongoose.model<IBankQuestion>('BankQuestion', BankQuestionSchema);
