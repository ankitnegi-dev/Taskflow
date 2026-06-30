import { create } from 'zustand';
import { Task, TaskFilters, PaginationMeta } from '@/types';
import { api } from '@/lib/api';

interface TaskStore {
  tasks: Task[];
  meta: PaginationMeta | null;
  filters: TaskFilters;
  isLoading: boolean;
  error: string | null;
  setFilters: (filters: Partial<TaskFilters>) => void;
  fetchTasks: () => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  meta: null,
  filters: { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
  isLoading: false,
  error: null,

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
      );
      const res = await api.get('/tasks', { params });
      set({
        tasks: res.data.data,
        meta: res.data.meta,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: 'Failed to load tasks' });
    }
  },

  createTask: async (data) => {
    const res = await api.post('/tasks', data);
    set((state) => ({ tasks: [res.data.data, ...state.tasks] }));
  },

  updateTask: async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? res.data.data : t)),
    }));
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },
}));
