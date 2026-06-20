import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role?: string; // e.g. 'Admin' or 'Teacher' or custom title
  institutionId?: mongoose.Types.ObjectId;
  schoolName?: string;
  schoolBranch?: string;
  schoolCode?: string;
  aiModel?: string;
  aiStrictNCERT?: boolean;
  aiIgnoreHandwriting?: boolean;
  aiStrictSpelling?: boolean;
  aiPartialFormulas?: boolean;
  aiLatePenalty?: number;
  aiCustomDirectives?: string[];
  aiCreativity?: number;
  plan?: string;
  planStatus?: string;
  creditsUsed?: number;
  creditsLimit?: number;
  adminPassword?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    imageUrl: { type: String },
    role: { type: String, default: 'Teacher' },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution' },
    schoolName: { type: String, default: 'Personal Workspace' },
    schoolBranch: { type: String, default: 'Independent' },
    schoolCode: { type: String, default: 'IND-WORKSPACE' },
    aiModel: { type: String, default: 'gemini-1.5-flash' },
    aiStrictNCERT: { type: Boolean, default: true },
    aiIgnoreHandwriting: { type: Boolean, default: true },
    aiStrictSpelling: { type: Boolean, default: false },
    aiPartialFormulas: { type: Boolean, default: true },
    aiLatePenalty: { type: Number, default: 10 },
    aiCustomDirectives: [{ type: String, default: [] }],
    aiCreativity: { type: Number, default: 0.2 },
    plan: { type: String, default: 'Free Trial' },
    planStatus: { type: String, default: 'active' },
    creditsUsed: { type: Number, default: 0 },
    creditsLimit: { type: Number, default: 10 },
    adminPassword: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
