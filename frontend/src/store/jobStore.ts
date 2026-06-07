// src/store/jobStore.ts
import { create } from 'zustand';

export interface JobState {
  jobId: string | null;
  status: 'idle' | 'queued' | 'processing' | 'done' | 'failed';
  progress: number;
  message: string;
  assignmentId: string | null;
  stage?: 'queued' | 'parsing' | 'prompting' | 'generating' | 'saving' | 'completed' | 'failed';
  sectionIndex?: number;
  totalSections?: number;
  setJobId: (id: string | null) => void;
  setStatus: (s: JobState['status']) => void;
  setProgress: (
    p: number,
    msg: string,
    stage?: JobState['stage'],
    sectionIndex?: number,
    totalSections?: number
  ) => void;
  setDone: (assignmentId: string, pdfUrl?: string) => void;
  reset: () => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobId: null,
  status: 'idle',
  progress: 0,
  message: '',
  assignmentId: null,
  stage: undefined,
  sectionIndex: undefined,
  totalSections: undefined,
  setJobId: (id) => set({ jobId: id }),
  setStatus: (status) => set({ status }),
  setProgress: (progress, message, stage, sectionIndex, totalSections) => 
    set({ progress, message, stage, sectionIndex, totalSections }),
  setDone: (assignmentId) => 
    set({ status: 'done', progress: 100, assignmentId, stage: 'completed', message: 'Finished! Loading paper preview...' }),
  reset: () => set({
    jobId: null,
    status: 'idle',
    progress: 0,
    message: '',
    assignmentId: null,
    stage: undefined,
    sectionIndex: undefined,
    totalSections: undefined
  })
}));
