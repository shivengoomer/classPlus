// src/models/template.model.ts
// Mongoose schema for assessment blueprint templates

import mongoose, { Schema, Document } from 'mongoose';

const TemplateSectionSchema = new Schema({
  type: {
    type: String,
    enum: ['mcq', 'short', 'long', 'truefalse', 'fillblank'],
    required: true,
  },
  count: { type: Number, required: true },
  marks: { type: Number, required: true },
}, { _id: false });

export interface ITemplateSection {
  type: string;
  count: number;
  marks: number;
}

export interface ITemplate extends Document {
  name: string;
  description: string;
  isDefault: boolean;
  createdBy: string | null;
  blueprint: {
    sections: ITemplateSection[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    createdBy: { type: String, default: null },
    blueprint: {
      sections: [TemplateSectionSchema],
    },
  },
  { timestamps: true }
);

export const Template = mongoose.model<ITemplate>('Template', TemplateSchema);
