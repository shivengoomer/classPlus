import { create } from 'zustand';
import { Template } from '@/types/group';
import { listTemplates, createTemplate, deleteTemplate } from '@/lib/api';

interface TemplateState {
  templates: Template[];
  isLoading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  saveTemplate: (data: Partial<Template>) => Promise<Template>;
  removeTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  isLoading: false,
  error: null,
  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await listTemplates();
      set({ templates: list, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch templates', isLoading: false });
    }
  },
  saveTemplate: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newTemplate = await createTemplate(data);
      set((state) => ({
        templates: [newTemplate, ...state.templates],
        isLoading: false
      }));
      return newTemplate;
    } catch (err: any) {
      set({ error: err.message || 'Failed to save template', isLoading: false });
      throw err;
    }
  },
  removeTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTemplate(id);
      set((state) => ({
        templates: state.templates.filter((t) => t._id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete template', isLoading: false });
      throw err;
    }
  }
}));
