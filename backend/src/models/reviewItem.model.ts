import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewItem extends Document {
  studentId: mongoose.Types.ObjectId; // References StudentCredential
  conceptTag: string;
  sourceQuestionId?: string; // Optional triggering question ID
  easeFactor: number; // SM-2 parameter (default 2.5)
  interval: number; // SM-2 interval in days (default 1)
  repetitions: number; // SM-2 repetitions count (default 0)
  nextReviewDate: Date; // Scheduled date for next review
  createdAt: Date;
  updatedAt: Date;
}

const ReviewItemSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentCredential', required: true, index: true },
    conceptTag: { type: String, required: true, index: true },
    sourceQuestionId: { type: String },
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 1 },
    repetitions: { type: Number, default: 0 },
    nextReviewDate: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true }
);

// A student can only have one review item per unique concept tag
ReviewItemSchema.index({ studentId: 1, conceptTag: 1 }, { unique: true });

export const ReviewItem = mongoose.model<IReviewItem>('ReviewItem', ReviewItemSchema);
