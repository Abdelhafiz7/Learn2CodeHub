import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui';
import { PublicLayout, DashboardLayout, AuthLayout } from '@/layouts';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';
import { InstructorReviews } from '@/pages/instructor/InstructorReviewsPage';
import { CertificatePage } from '@/pages/student/CertificatePage';
import { MyListPage } from '@/pages/student/MyListPage';
import { ProfilePage } from '@/pages/auth/ProfilePage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ResendVerificationPage } from '@/pages/auth/resend-verification';
import { ConfirmEmailChangePage } from '@/pages/auth/ConfirmEmailChangePage';
import { CreateCategoryPage } from '@/pages/admin/CreateCategoryPage';
import { EditCategoryPage } from '@/pages/admin/EditCategoryPage';
import { CategoriesPage } from '@/pages/admin/CategoriesPage';
import { CategoryDetailPage } from '@/pages/public/CategoryDetailPage';
import { InstructorProfilePage } from '@/pages/public/InstructorProfilePage';
import { AdminPendingCoursesPage } from '@/pages/admin/AdminPendingCourses';
import { AdminCoursePreviewPage } from '@/pages/admin/AdminCoursePreviewPage';

// ─── Lazy-loaded pages

// Public
const HomePage = lazy(() =>
  import('@/pages/public/HomePage').then((m) => ({ default: m.HomePage }))
);
const CoursesPage = lazy(() =>
  import('@/pages/public/CoursesPage').then((m) => ({ default: m.CoursesPage }))
);
const CourseDetailPage = lazy(() =>
  import('@/pages/public/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage }))
);

// Auth
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);

// Student
const StudentDashboard = lazy(() =>
  import('@/pages/student/StudentDashboard').then((m) => ({ default: m.StudentDashboard }))
);
const MyCoursesPage = lazy(() =>
  import('@/pages/student/MyCoursesPage').then((m) => ({ default: m.MyCoursesPage }))
);
const CourseLearningPage = lazy(() =>
  import('@/pages/student/CourseLearningPage').then((m) => ({ default: m.CourseLearningPage }))
);

// Instructor
const InstructorDashboard = lazy(() =>
  import('@/pages/instructor/InstructorDashboard').then((m) => ({ default: m.InstructorDashboard }))
);
const InstructorCoursesPage = lazy(() =>
  import('@/pages/instructor/InstructorCoursesPage').then((m) => ({ default: m.InstructorCoursesPage }))
);
const CreateCoursePage = lazy(() =>
  import('@/pages/instructor/CreateCoursePage').then((m) => ({ default: m.CreateCoursePage }))
);
const ManageCoursePage = lazy(() =>
  import('@/pages/instructor/ManageCoursePage').then((m) => ({ default: m.ManageCoursePage }))
);
const ManageCourseContentPage = lazy(() =>
  import('@/pages/instructor/ManageCourseContentPage').then((m) => ({
    default: m.ManageCourseContentPage,
  }))
);

// Admin
const AdminDashboard = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const ManageUsersPage = lazy(() =>
  import('@/pages/admin/ManageUsersPage').then((m) => ({ default: m.ManageUsersPage }))
);
const AdminCoursesPage = lazy(() =>
  import('@/pages/admin/AdminCoursesPage').then((m) => ({ default: m.AdminCoursesPage }))
);

// Error pages
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const UnauthorizedPage = lazy(() =>
  import('@/pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage }))
);

// ─── Suspense Wrapper 

const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner fullPage text="Loading..." />}>
    {children}
  </Suspense>
);

// ─── Router Configuration

const router = createBrowserRouter([
  // ── Public Routes
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <SuspenseWrapper><HomePage /></SuspenseWrapper>,
      },
      {
        path: '/courses',
        element: <SuspenseWrapper><CoursesPage /></SuspenseWrapper>,
      },
      {
        path: '/courses/:id',
        element: <SuspenseWrapper><CourseDetailPage /></SuspenseWrapper>,
      },
      {
        path: '/unauthorized',
        element: <SuspenseWrapper><UnauthorizedPage /></SuspenseWrapper>,
      },
      {
        path: '/categories/:id',
        element: <SuspenseWrapper><CategoryDetailPage /></SuspenseWrapper>,
      },
      {
        path: "/instructors/:id",
        element: <InstructorProfilePage />
      }
    ],
  },

  // ── Auth Routes (Guest only) 
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <GuestRoute>
            <SuspenseWrapper><LoginPage /></SuspenseWrapper>
          </GuestRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <GuestRoute>
            <SuspenseWrapper><RegisterPage /></SuspenseWrapper>
          </GuestRoute>
        ),
      },
      {
        path: '/verify-email',
        element: <SuspenseWrapper><VerifyEmailPage /></SuspenseWrapper>,
      },
      {
        path: '/forgot-password',
        element: <SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper>,
      },
      {
        path: '/reset-password',
        element: <SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper>,
      },
      {
        path: '/resend-verification',
        element: <ResendVerificationPage />,
      },
      {
        path: '/confirm-email-change',
        element: <SuspenseWrapper><ConfirmEmailChangePage /></SuspenseWrapper>,
      },
    ],
  },

  // ── Student Routes 
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['Student']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <SuspenseWrapper><StudentDashboard /></SuspenseWrapper>,
      },
      {
        path: 'my-courses',
        element: <SuspenseWrapper><MyCoursesPage /></SuspenseWrapper>,
      },
      {
        path: 'certificates/:courseId',
        element: <SuspenseWrapper><CertificatePage /></SuspenseWrapper>,
      },
      {
        path: 'my-list',
        element: <SuspenseWrapper><MyListPage /></SuspenseWrapper>,
      },
    ],
  },

  // Profile (Student) - No Sidebar
  {
    path: '/student/profile',
    element: (
      <ProtectedRoute allowedRoles={['Student']}>
        <PublicLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper>,
      }
    ]
  },

  // Course Learning (full-screen, no sidebar)
  {
    path: '/student/courses/:courseId/learn',
    element: (
      <ProtectedRoute allowedRoles={['Student']}>
        <SuspenseWrapper><CourseLearningPage /></SuspenseWrapper>
      </ProtectedRoute>
    ),
  },

  // ── Instructor Routes
  {
    path: '/instructor',
    element: (
      <ProtectedRoute allowedRoles={['Instructor']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <SuspenseWrapper><InstructorDashboard /></SuspenseWrapper>,
      },
      {
        path: 'courses',
        element: <SuspenseWrapper><InstructorCoursesPage /></SuspenseWrapper>,
      },
      {
        path: 'courses/new',
        element: <SuspenseWrapper><CreateCoursePage /></SuspenseWrapper>,
      },
      {
        path: 'courses/:courseId/edit',
        element: <SuspenseWrapper><ManageCoursePage /></SuspenseWrapper>,
      },
      {
        path: 'courses/:courseId/content',
        element: <SuspenseWrapper><ManageCourseContentPage /></SuspenseWrapper>,
      },
      {
        path: "reviews",
        element: <SuspenseWrapper><InstructorReviews /></SuspenseWrapper>,
      },
      
    ],
  },

  // Profile (Instructor) - No Sidebar
  {
    path: '/instructor/profile',
    element: (
      <ProtectedRoute allowedRoles={['Instructor']}>
        <PublicLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper>,
      }
    ]
  },

  // ── Admin Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['Admin']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <SuspenseWrapper><AdminDashboard /></SuspenseWrapper>,
      },
      {
        path: 'users',
        element: <SuspenseWrapper><ManageUsersPage /></SuspenseWrapper>,
      },
      {
        path: 'courses',
        element: <SuspenseWrapper><AdminCoursesPage /></SuspenseWrapper>,
      },
      {
        path: 'categories',
        element: <SuspenseWrapper><CategoriesPage /></SuspenseWrapper>,
      },
      {
        path: 'categories/new',
        element: <SuspenseWrapper><CreateCategoryPage /></SuspenseWrapper>,
      },
      {
        path: 'categories/:id/edit',
        element: <SuspenseWrapper><EditCategoryPage /></SuspenseWrapper>,
      },
      {
        path: '/admin/pending-courses',
        element: <SuspenseWrapper><AdminPendingCoursesPage /></SuspenseWrapper>,
      },
      {
        path: '/admin/courses/:id/preview',
        element: <SuspenseWrapper><AdminCoursePreviewPage /></SuspenseWrapper>,
      }
    ],
  },

  // Profile (Admin) - No Sidebar
  {
    path: '/admin/profile',
    element: (
      <ProtectedRoute allowedRoles={['Admin']}>
        <PublicLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper>,
      }
    ]
  },

  // ── 404 
  {
    path: '*',
    element: <SuspenseWrapper><NotFoundPage /></SuspenseWrapper>,
  },
]);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;
