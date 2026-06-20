import mongoose, { Schema, Document } from 'mongoose';

export interface IInstitution extends Document {
  name: string;
  address?: string;
  board?: string;
  branch?: string;
  schoolCode?: string;
  adminIds: string[]; // Clerk user IDs
  creditsLimit: number;
  creditsUsed: number;
  planStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    board: { type: String, default: 'CBSE' },
    branch: { type: String },
    schoolCode: { type: String },
    adminIds: [{ type: String }],
    creditsLimit: { type: Number, default: 500 },
    creditsUsed: { type: Number, default: 0 },
    planStatus: { type: String, default: 'active' },
  },
  { timestamps: true }
);

export const Institution = mongoose.model<IInstitution>('Institution', InstitutionSchema);
