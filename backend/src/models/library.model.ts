// src/models/library.model.ts
// Mongoose schema for library assets (folders, pdf/doc reference files)

import mongoose, { Schema, Document } from 'mongoose';

export interface ILibraryItem extends Document {
  name: string;
  type: 'folder' | 'pdf' | 'doc';
  size?: string;
  category: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LibraryItemSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['folder', 'pdf', 'doc'],
      required: true,
    },
    size: { type: String },
    category: { type: String, required: true },
    url: { type: String },
  },
  {
    timestamps: true,
  }
);

export const LibraryItem = mongoose.model<ILibraryItem>('LibraryItem', LibraryItemSchema);
