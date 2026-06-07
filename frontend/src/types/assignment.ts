// src/types/assignment.ts
import { QuestionType, Section } from './question';

export interface AssignmentRow {
  type: QuestionType;
  count: number;
  marks: number;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionRows: AssignmentRow[];
  totalMarks: number;
  additionalInstructions?: string;
  fileUrl?: string;
  pdfUrl?: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  jobId?: string;
  result?: {
    aiMessage: string;       // e.g. "Certainly, Lakshya! Here are customized..."
    schoolName: string;
    subject: string;
    grade: string;
    timeAllowed: string;
    totalMarks: number;
    sections: Section[];
    answerKey: { questionId: string; answer: string }[];
    generatedAt: string;
  };
  parentAssignmentId?: string;
  createdAt: string;
}

export interface CreateAssignmentDTO {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionRows: AssignmentRow[];
  additionalInstructions?: string;
  file?: File | null;
  fileUrl?: string;
}
