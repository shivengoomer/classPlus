// src/models/group.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IGroup extends Document {
  name: string;
  grade: string;
  subject: string;
  students: string[];
  rubric?: string;
  classCode: string;
  userId?: string;
  institutionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema(
  {
    name: { type: String, required: true },
    grade: { type: String, required: true },
    subject: { type: String, required: true },
    students: [{ type: String }],
    rubric: { type: String },
    classCode: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(3).toString('hex').toUpperCase(), // 6-char e.g. "A3F9BC"
    },
    userId: { type: String },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
  },
  { timestamps: true }
);

export const Group = mongoose.model<IGroup>('Group', GroupSchema);
