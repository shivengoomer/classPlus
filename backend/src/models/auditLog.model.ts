import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: string; // Clerk ID or Student Email/ID
  actorModel: 'User' | 'StudentCredential';
  actorName: string;
  action: string; // e.g. 'CREATE_GROUP', 'DELETE_GROUP', 'SUBMIT_GRADE', 'UPGRADE_PLAN', etc.
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema(
  {
    actorId: { type: String, required: true, index: true },
    actorModel: { type: String, required: true, enum: ['User', 'StudentCredential'] },
    actorName: { type: String, required: true },
    action: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
