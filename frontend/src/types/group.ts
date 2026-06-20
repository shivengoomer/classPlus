// src/types/group.ts
// TypeScript types for Groups, AssignedAssignments, StudentSubmissions, Misconceptions, Rubrics, Templates

export interface Group {
  _id: string;
  name: string;
  grade: string;
  subject: string;
  students: string[];
  rubric?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Misconception {
  label: string;
  affectedCount: number;
  explanation: string;
}

export interface QuestionMisconception {
  questionId: string;
  misconceptions: Misconception[];
}

export interface HintLogEntry {
  studentName: string;
  questionId: string;
  timestamp: string;
}

export interface AssignedAssignment {
  _id: string;
  assignmentId: string;
  groupId: string;
  assignedDate: string;
  dueDate: string;
  hintsEnabled: boolean;
  durationMinutes: number | null;
  misconceptionAnalysis: QuestionMisconception[];
  hintLog: HintLogEntry[];
  userId?: string;
  // populated fields
  assignment?: import('./assignment').Assignment;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerEntry {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  marks: number;
  aiFeedback?: string;
}

export interface StudentSubmission {
  _id: string;
  assignedAssignmentId: string;
  studentName: string;
  answers: AnswerEntry[];
  totalScore: number;
  totalMarks: number;
  startedAt: string | null;
  submittedAt: string | null;
  autoSubmitted: boolean;
  timerJobId: string | null;
  similarityScore?: number;
  similarityFlaggedWith?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RubricCriteria {
  label: string;
  marks: number;
  description: string;
}

export interface Rubric {
  criteria: RubricCriteria[];
}

export interface TemplateSection {
  type: string;
  count: number;
  marks: number;
}

export interface Template {
  _id: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdBy: string | null;
  subject?: string;
  grade?: string;
  additionalInstructions?: string;
  blueprint: {
    sections: TemplateSection[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgress {
  assignments: {
    title: string;
    date: string;
    score: number;
    totalMarks: number;
    conceptScores: Record<string, number>;
  }[];
}
