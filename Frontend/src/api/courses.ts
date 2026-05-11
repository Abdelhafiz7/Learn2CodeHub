import axiosInstance from './axiosInstance';
import type {
  Category,
  Course,
  CourseDetail,
  CourseFilters,
  CreateCourseRequest,
  Enrollment,
  PaginatedResponse,
} from '@/types';


// ======================
// 🔹 Extra Types (NEW)
// ======================

export type Review = {
  id: number;
  courseId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
};

export type CreateReviewRequest = {
  rating: number;
  comment?: string;
};

export type CourseProgress = {
  courseId: number;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
};


export const coursesApi = {

  // Public
  getCourses: async (filters?: CourseFilters): Promise<PaginatedResponse<Course>> => {
    const response = await axiosInstance.get<PaginatedResponse<Course>>('/courses', {
      params: filters,
    });
    return response.data;
  },

  getCourseById: async (id: string): Promise<CourseDetail> => {
    const response = await axiosInstance.get<CourseDetail>(`/courses/${id}`);
    return response.data;
  },

  getFeaturedCourses: async (): Promise<Course[]> => {
    const res = await axiosInstance.get<PaginatedResponse<Course>>('/courses', {
      params: { pageSize: 8 },
    });
    return res.data.items;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await axiosInstance.get<PaginatedResponse<Category>>('/categories');
    return response.data.items;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await axiosInstance.get<Category>(`/categories/${id}`);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<{ name: string; description: string; icon: string }>): Promise<Category> => {
    const response = await axiosInstance.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/categories/${id}`);
  },

  getRelatedCategories: async (categoryId: string): Promise<Category[]> => {
    const res = await axiosInstance.get(`/categories/${categoryId}/related`);
    return res.data;
  },

  getRelatedCourses: async (courseId: string): Promise<Course[]> => {
    const res = await axiosInstance.get(`/courses/${courseId}/related`);
    return res.data;
  },

  getMe: async () => {
    const res = await axiosInstance.get('/auth/me');
    return res.data;
  },

  getRecommendations: async (): Promise<Course[]> => {
    const res = await axiosInstance.get<Course[]>('/courses/recommendations');
    return res.data;
  },


  // Student
  getMyEnrollments: async (): Promise<Enrollment[]> => {
    const response = await axiosInstance.get<Enrollment[]>('/enrollments/my-courses');
    return response.data;
  },

  enrollInCourse: async (courseId: string) => {
    const response = await axiosInstance.post('/enrollments', { courseId });
    return response.data;
  },

  markLessonComplete: async (lessonId: number): Promise<void> => {
    await axiosInstance.put(`/lessonprogress/${lessonId}/complete`);
  },
  getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
    const response = await axiosInstance.get<CourseProgress>(`/courses/${courseId}/progress`);
    return response.data;
  },


  // Instructor
  getInstructorCourses: async (): Promise<Course[]> => {
    const response = await axiosInstance.get<Course[]>('/courses/instructor');
    return response.data;
  },

  createCourse: async (data: CreateCourseRequest): Promise<Course> => {
    const response = await axiosInstance.post<Course>('/courses', data);
    return response.data;
  },

  updateCourse: async (id: string, data: Partial<CreateCourseRequest>): Promise<Course> => {
    const response = await axiosInstance.put<Course>(`/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/courses/${id}`);
  },

  publishCourse: async (id: number): Promise<Course> => {
    const response = await axiosInstance.patch<Course>(`/courses/${id}/publish`);
    return response.data;
  },

  getInstructorStats: async () => {
    const res = await axiosInstance.get('/instructor/stats');
    return res.data;
  },

  getInstructorProfile: async (id: string) => {
    console.log("Fetching instructor:", id);
    const res = await axiosInstance.get(`/instructor/${id}`);
    return res.data;
  },

  // Admin
  adminGetAllCourses: async (params?: { page?: number; pageSize?: number; search?: string; category?: string }) => {
    const response = await axiosInstance.get('/dashboard/admin/courses', { params });
    return response.data;
  },

  adminDeleteCourse: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/dashboard/admin/courses/${id}`);
  },

  adminUpdateCourseStatus: async (id: string, status: string) => {
    const response = await axiosInstance.patch(`/dashboard/admin/courses/${id}/status`, { status });
    return response.data;
  },


  // Reviews
  getCourseReviews: async (courseId: string): Promise<Review[]> => {
    const res = await axiosInstance.get<Review[]>(`/courses/${courseId}/reviews`);
    return res.data;
  },

  createReview: async (courseId: string, data: { rating: number; comment: string }): Promise<Review> => {
    const res = await axiosInstance.post<Review>('/reviews', {
      ...data,
      courseId: Number(courseId),
    });
    return res.data;
  },



  deleteReview: async (courseId: string) => {
    await axiosInstance.delete(`/reviews/${courseId}`);
  },


  // Lesson Progress
  updateLessonProgress: async (lessonId: number, percentage: number) => {
    const res = await axiosInstance.post('/lessonprogress/update', {
      lessonId,
      watchedPercentage: percentage,
    });
    return res.data;
  },

  getCompletedLessons: async (courseId: string): Promise<number[]> => {
    const res = await axiosInstance.get(`/lessonprogress/course/${courseId}/completed`);
    return res.data;
  },

  getLastLesson: async (courseId: string): Promise<number | null> => {
    const res = await axiosInstance.get(`/lessonprogress/course/${courseId}/progress`);
    return res.data;
  },

  getLessonProgress: async (lessonId: number) => {
    const response = await axiosInstance.get(
      `/LessonProgress/${lessonId}`
    );
    return response.data;
  },

  getLessonNote: async (lessonId: number) => {
    const res = await axiosInstance.get(`/note/${lessonId}`);
    return res.data;
  },

  saveLessonNote: async (lessonId: number, content: string) => {
    const res = await axiosInstance.post(`/note`, {
      lessonId,
      content,
    });
    return res.data;
  },

  completeCourse: async (courseId: string) => {
    const response = await axiosInstance.put(
      `/Enrollments/complete/${courseId}`
    );
    return response.data;
  },

  getLearningStreak: async (): Promise<number> => {
    const res = await axiosInstance.get("/enrollments/streak");
    return res.data;
  },


  getCertificate: (courseId: number) =>
    axiosInstance.get(`/enrollments/certificate/${courseId}`).then(res => res.data),

};