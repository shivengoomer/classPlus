// src/models/group.model.ts
// Mongoose schema for class groups — organizes students by class/section

import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  grade: string;
  subject: string;
  students: string[];
  rubric?: string;
  userId?: string;
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
    userId: { type: String },
  },
  { timestamps: true }
);

export const Group = mongoose.model<IGroup>('Group', GroupSchema);
