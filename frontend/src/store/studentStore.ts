// src/store/studentStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudentGroup {
  _id: string;
  name: string;
  grade: string;
  subject: string;
  classCode: string;
}

interface StudentState {
  studentName: string | null;
  studentEmail: string | null;
  groups: StudentGroup[];
  setSession: (studentName: string, studentEmail: string, groups: StudentGroup[]) => void;
  clearSession: () => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      studentName: null,
      studentEmail: null,
      groups: [],
      setSession: (studentName, studentEmail, groups) =>
        set({ studentName, studentEmail, groups }),
      clearSession: () =>
        set({ studentName: null, studentEmail: null, groups: [] }),
    }),
    {
      name: 'classPlus-student-v2',
    }
  )
);
