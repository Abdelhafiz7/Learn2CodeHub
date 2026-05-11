import { create } from 'zustand';
import type { Course, CourseFilters } from '@/types';

interface CourseState {
  courses: Course[];
  totalCourses: number;
  currentPage: number;
  filters: CourseFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCourses: (courses: Course[], total: number) => void;
  appendCourses: (courses: Course[], total: number) => void;
  setFilters: (filters: Partial<CourseFilters>) => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetFilters: () => void;
}

const defaultFilters: CourseFilters = {
  page: 1,
  pageSize: 8,
  sortBy: 'newest',
};

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  totalCourses: 0,
  currentPage: 1,
  filters: defaultFilters,
  isLoading: false,
  error: null,

  setCourses: (courses, total) => set({ courses, totalCourses: total }),
  appendCourses: (newCourses, total) =>
    set((state) => ({
      courses: [...state.courses, ...newCourses],
      totalCourses: total,
    })),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
      currentPage: 1,
    })),

  setPage: (page) =>
    set((state) => ({
      currentPage: page,
      filters: { ...state.filters, page },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  resetFilters: () => set({ filters: defaultFilters, currentPage: 1 }),
}));
