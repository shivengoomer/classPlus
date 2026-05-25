// src/types/question.ts

export type Difficulty = 'easy' | 'moderate' | 'challenging';

export type QuestionType = 'mcq' | 'short' | 'long' | 'truefalse' | 'fillblank';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
  answer?: string;
}

export interface Section {
  id: string;
  label: string;            // e.g. "A", "B", "C"
  title: string;            // e.g. "Short Answer Questions"
  instruction: string;      // e.g. "Attempt all questions. Each question carries 2 marks"
  questions: Question[];
  totalMarks: number;
}
