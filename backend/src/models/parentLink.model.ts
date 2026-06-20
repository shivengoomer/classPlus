import mongoose, { Schema, Document } from 'mongoose';

export interface IParentLink extends Document {
  parentId: mongoose.Types.ObjectId; // References User model
  studentId: mongoose.Types.ObjectId; // References StudentCredential model
  relationship?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParentLinkSchema = new Schema(
  {
    parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentCredential', required: true, index: true },
    relationship: { type: String, default: 'Guardian' },
  },
  { timestamps: true }
);

// Compound index so a parent is linked to a student at most once
ParentLinkSchema.index({ parentId: 1, studentId: 1 }, { unique: true });

export const ParentLink = mongoose.model<IParentLink>('ParentLink', ParentLinkSchema);
