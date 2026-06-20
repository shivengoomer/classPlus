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
  token: string | null;
  _hasHydrated: boolean;
  setSession: (studentName: string, studentEmail: string, groups: StudentGroup[], token: string) => void;
  clearSession: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      studentName: null,
      studentEmail: null,
      groups: [],
      token: null,
      _hasHydrated: false,
      setSession: (studentName, studentEmail, groups, token) =>
        set({ studentName, studentEmail, groups, token }),
      clearSession: () =>
        set({ studentName: null, studentEmail: null, groups: [], token: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'classPlus-student-v2',
      partialize: (state) => ({
        studentName: state.studentName,
        studentEmail: state.studentEmail,
        groups: state.groups,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
