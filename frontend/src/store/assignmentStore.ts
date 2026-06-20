// src/store/assignmentStore.ts
import { create } from 'zustand';
import { Assignment } from '@/types/assignment';

interface AssignmentState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  setAssignments: (list: Assignment[]) => void;
  addAssignment: (a: Assignment) => void;
  deleteAssignment: (id: string) => void;
  setCurrentAssignment: (a: Assignment | null) => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => {
  return {
    assignments: [],
    currentAssignment: null,
    setAssignments: (list) => {
      set({ assignments: list });
      if (typeof window !== 'undefined') {
        localStorage.setItem('classplus_assignments', JSON.stringify(list));
      }
    },
    addAssignment: (a) => {
      set((state) => {
        const updated = [...state.assignments, a];
        if (typeof window !== 'undefined') {
          localStorage.setItem('classplus_assignments', JSON.stringify(updated));
        }
        return { assignments: updated };
      });
    },
    deleteAssignment: (id) => {
      set((state) => {
        const updated = state.assignments.filter((item) => item._id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('classplus_assignments', JSON.stringify(updated));
        }
        return { 
          assignments: updated,
          currentAssignment: state.currentAssignment?._id === id ? null : state.currentAssignment
        };
      });
    },
    setCurrentAssignment: (a) => set({ currentAssignment: a })
  };
});
