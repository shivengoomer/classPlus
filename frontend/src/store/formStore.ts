// src/store/formStore.ts
import { create } from 'zustand';
import { QuestionType } from '@/types/question';

export interface QuestionConfigRow {
  type: QuestionType;
  count: number;
  marks: number;
  rubric?: { label: string; marks: number; description: string }[];
}

interface FormState {
  title: string;
  subject: string;
  grade: string;
  file: File | null;
  fileUrl: string | null;
  dueDate: string;
  questionRows: QuestionConfigRow[];
  additionalInstructions: string;
  setTitle: (t: string) => void;
  setSubject: (s: string) => void;
  setGrade: (g: string) => void;
  setFile: (f: File | null) => void;
  setFileUrl: (url: string | null) => void;
  setDueDate: (d: string) => void;
  addRow: () => void;
  removeRow: (index: number) => void;
  updateRow: (index: number, field: 'type' | 'count' | 'marks' | 'rubric', value: any) => void;
  setQuestionRows: (rows: QuestionConfigRow[]) => void;
  setInstructions: (s: string) => void;
  reset: () => void;
}

const DEFAULT_ROWS: QuestionConfigRow[] = [
  { type: 'mcq', count: 4, marks: 1 },
  { type: 'short', count: 3, marks: 2 }
];

export const useFormStore = create<FormState>((set) => ({
  title: '',
  subject: '',
  grade: '',
  file: null,
  fileUrl: null,
  dueDate: '',
  questionRows: DEFAULT_ROWS,
  additionalInstructions: '',
  setTitle: (title) => set({ title }),
  setSubject: (subject) => set({ subject }),
  setGrade: (grade) => set({ grade }),
  setFile: (file) => set({ file, fileUrl: null }), // selecting a file clears pre-existing URL
  setFileUrl: (fileUrl) => set({ fileUrl, file: null }), // selecting a URL clears local file
  setDueDate: (dueDate) => set({ dueDate }),
  addRow: () => set((state) => ({
    questionRows: [...state.questionRows, { type: 'mcq', count: 5, marks: 1 }]
  })),
  removeRow: (index) => set((state) => ({
    questionRows: state.questionRows.filter((_, i) => i !== index)
  })),
  updateRow: (index, field, value) => set((state) => {
    const updated = state.questionRows.map((row, i) => {
      if (i === index) {
        return { ...row, [field]: value };
      }
      return row;
    });
    return { questionRows: updated };
  }),
  setQuestionRows: (questionRows) => set({ questionRows }),
  setInstructions: (additionalInstructions) => set({ additionalInstructions }),
  reset: () => set({
    title: '',
    subject: '',
    grade: '',
    file: null,
    fileUrl: null,
    dueDate: '',
    questionRows: [
      { type: 'mcq', count: 4, marks: 1 },
      { type: 'short', count: 3, marks: 2 }
    ],
    additionalInstructions: ''
  })
}));
