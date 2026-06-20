import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentCredential extends Document {
  studentName: string;
  email: string;
  groupIds: mongoose.Types.ObjectId[];
  hashedPasscode: string;
  institutionId?: mongoose.Types.ObjectId;
  parentInviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentCredentialSchema = new Schema(
  {
    studentName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    hashedPasscode: { type: String, required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    parentInviteCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export const StudentCredential = mongoose.model<IStudentCredential>('StudentCredential', StudentCredentialSchema);
