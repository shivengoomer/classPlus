// src/store/jobStore.ts
import { create } from 'zustand';

export interface JobState {
  jobId: string | null;
  status: 'idle' | 'queued' | 'processing' | 'done' | 'failed';
  progress: number;
  message: string;
  assignmentId: string | null;
  setJobId: (id: string | null) => void;
  setStatus: (s: JobState['status']) => void;
  setProgress: (p: number, msg: string) => void;
  setDone: (assignmentId: string) => void;
  reset: () => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobId: null,
  status: 'idle',
  progress: 0,
  message: '',
  assignmentId: null,
  setJobId: (id) => set({ jobId: id }),
  setStatus: (status) => set({ status }),
  setProgress: (progress, message) => set({ progress, message }),
  setDone: (assignmentId) => set({ status: 'done', progress: 100, assignmentId }),
  reset: () => set({
    jobId: null,
    status: 'idle',
    progress: 0,
    message: '',
    assignmentId: null
  })
}));
