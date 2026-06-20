import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  groupId: mongoose.Types.ObjectId;
  teacherId: string; // Clerk ID of the posting teacher
  teacherName: string;
  title: string;
  content: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    teacherId: { type: String, required: true },
    teacherName: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
