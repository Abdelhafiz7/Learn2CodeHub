//  User & Auth 

export type UserRole = 'Student' | 'Instructor' | 'Admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Student" | "Instructor" | "Admin";
  bio?: string;
  profileImageUrl?: string;
  createdAt?: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedInUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  major?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    profileImageUrl?: string;
    githubUrl?: string;
    twitterUrl?: string;
    linkedInUrl?: string;
    youtubeUrl?: string;
    websiteUrl?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: number;
  email: string;
  role: string;
  token: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

// Courses

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseStatus = 'Draft' | 'Published' | 'Archived';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  courseCount?: number;
}

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  bio?: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedInUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  rating: number;
  reviewCount: number;
  totalStudents: number;
  totalCourses: number;
  major?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnailUrl?: string;
  price: number;
  level: CourseLevel;
  status: CourseStatus;
  category: Category;
  totalLessons: number;
  totalDuration: number;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;

  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    bio?: string;
    rating: number;
    reviewCount: number;
    totalStudents: number;
    totalCourses: number;
    totalReviewers: number;
  };
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  level: CourseLevel;
  categoryId: number;
  thumbnailUrl?: string;
}

// Sections & Lessons

export interface Lesson {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  fileUrl?: string;
  duration: number;
  order: number;
  isPreview: boolean;
  isCompleted?: boolean;
  videoDuration?: number;
  videoProgress?: number;
  createdAt: string;
  updatedAt: string;
  durationInMinutes: number;
  content?: string | null;
}

export interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseDetail extends Course {
  sections: Section[];
  whatYouLearn: string[];
  requirements: string[];
  targetAudience: string[];
}

// Enrollments

export interface Enrollment {
  id: number;
  courseId: number;
  progress: number;
  lastAccessedAt: string | null;
  lastLessonId?: number | null;

  course: {
    title: string;
    thumbnailUrl?: string;
    totalDuration?: number;
    totalLessons: number;
    nextLessonTitle?: string;
    level: string;

    instructor?: {
      firstName: string;
      lastName: string;
    };
  };

}

// Reviews 
export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  } | null;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CourseFilters {
  search?: string;
  categoryId?: string;
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'newest' | 'popular' | 'rating' | 'price-asc' | 'price-desc';
}

// API Error

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}
