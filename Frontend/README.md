# LearnHub — React Course Platform Frontend

A modern, production-ready React frontend for a full-stack online course platform (Udemy/Codecademy-style), built to connect to an ASP.NET Core Web API backend with JWT authentication.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **React 19 + Vite** | UI framework and build tool |
| **TypeScript** | Type safety across the entire codebase |
| **React Router v7** | Client-side routing with lazy loading |
| **Axios** | HTTP client with JWT interceptors |
| **Zustand** | Lightweight global state management |
| **Tailwind CSS v4** | Utility-first styling |
| **Lucide React** | Icon library |
| **React Hot Toast** | Toast notifications |

---

## Project Structure

```
src/
├── api/                    # Axios instance + all API call functions
│   ├── axiosInstance.ts    # Axios config, request/response interceptors
│   ├── auth.ts             # Login, register, refresh token
│   ├── courses.ts          # Course CRUD, enrollments, lessons
│   ├── users.ts            # User management (admin)
│   └── index.ts            # Barrel export
│
├── components/
│   ├── ui/                 # Reusable UI primitives
│   │   ├── Button.tsx      # Variants: primary, secondary, outline, ghost, danger
│   │   ├── Input.tsx       # With label, error, left/right icon support
│   │   ├── Select.tsx      # Styled select with options array
│   │   ├── Textarea.tsx    # Resizable textarea with label/error
│   │   ├── Badge.tsx       # Status badges (success, warning, info, etc.)
│   │   ├── Card.tsx        # Container card with padding variants
│   │   ├── Modal.tsx       # Accessible modal with backdrop
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StarRating.tsx
│   │   └── Avatar.tsx
│   ├── layout/
│   │   ├── Navbar.tsx      # Responsive top nav with user menu
│   │   ├── Sidebar.tsx     # Collapsible dashboard sidebar (role-aware)
│   │   └── Footer.tsx
│   └── course/
│       ├── CourseCard.tsx  # Course card for grids/lists
│       └── CourseGrid.tsx  # Responsive grid of course cards
│
├── layouts/
│   ├── PublicLayout.tsx    # Navbar + Footer wrapper for public pages
│   ├── DashboardLayout.tsx # Sidebar + content area for authenticated pages
│   └── AuthLayout.tsx      # Centered card layout for login/register
│
├── pages/
│   ├── public/
│   │   ├── HomePage.tsx         # Hero, features, featured courses
│   │   ├── CoursesPage.tsx      # Filterable course catalog with pagination
│   │   └── CourseDetailPage.tsx # Full course info, curriculum, enrollment
│   ├── auth/
│   │   ├── LoginPage.tsx        # JWT login with form validation
│   │   └── RegisterPage.tsx     # Registration with role selection
│   ├── student/
│   │   ├── StudentDashboard.tsx # Progress overview, continue learning
│   │   ├── MyCoursesPage.tsx    # Enrolled courses with filter tabs
│   │   └── CourseLearningPage.tsx # Full-screen lesson viewer with sidebar
│   ├── instructor/
│   │   ├── InstructorDashboard.tsx  # Stats, recent courses table
│   │   ├── InstructorCoursesPage.tsx # All instructor courses
│   │   ├── CreateCoursePage.tsx     # 3-step course creation wizard
│   │   └── ManageCoursePage.tsx     # Edit, publish, delete course
│   ├── admin/
│   │   ├── AdminDashboard.tsx   # Platform-wide stats, recent activity
│   │   ├── ManageUsersPage.tsx  # Paginated user table with role management
│   │   └── AdminCoursesPage.tsx # Paginated course table with status control
│   ├── NotFoundPage.tsx
│   └── UnauthorizedPage.tsx
│
├── routes/
│   ├── AppRouter.tsx       # Full route tree with lazy loading
│   ├── ProtectedRoute.tsx  # Auth guard + role-based access
│   └── GuestRoute.tsx      # Redirect authenticated users from auth pages
│
├── store/
│   ├── authStore.ts        # Zustand store: user, token, login/logout
│   ├── courseStore.ts      # Zustand store: course list, filters
│   └── index.ts
│
├── hooks/
│   ├── useAuth.ts          # Auth actions (login, register, logout)
│   ├── useCourses.ts       # Course fetching with filters
│   ├── useApi.ts           # Generic data-fetching hook with loading/error
│   └── index.ts
│
├── types/
│   └── index.ts            # All TypeScript interfaces and types
│
└── utils/
    └── index.ts            # formatPrice, formatDate, formatDuration, etc.
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Your ASP.NET Core backend running at `https://localhost:5001`

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment config
cp .env.example .env

# Edit .env to point to your backend
# VITE_API_URL=https://localhost:5001/api

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
pnpm build
pnpm preview   # Preview the production build locally
```

---

## Backend API Contract

The frontend expects the following endpoints on your ASP.NET Core API:

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Returns `{ token, user }` |
| `POST` | `/api/auth/register` | Creates user, returns `{ token, user }` |
| `GET` | `/api/auth/me` | Returns current user from token |

### Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/courses` | List courses (supports `?search`, `?category`, `?level`, `?page`) |
| `GET` | `/api/courses/:id` | Course detail with sections and lessons |
| `POST` | `/api/courses` | Create course (Instructor) |
| `PUT` | `/api/courses/:id` | Update course (Instructor) |
| `DELETE` | `/api/courses/:id` | Delete course |
| `POST` | `/api/courses/:id/publish` | Publish course |
| `GET` | `/api/courses/my` | Instructor's own courses |
| `GET` | `/api/courses/categories` | List categories |

### Enrollments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/enrollments/my` | Student's enrollments |
| `POST` | `/api/enrollments` | Enroll in a course |
| `POST` | `/api/lessons/:id/complete` | Mark lesson complete |

### Users (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/users` | Paginated user list |
| `PUT` | `/api/admin/users/:id` | Update user role |
| `DELETE` | `/api/admin/users/:id` | Delete user |
| `GET` | `/api/admin/stats` | Platform statistics |

---

## Authentication Flow

1. User submits login form → `POST /api/auth/login`
2. Backend returns `{ token: "...", user: { id, email, role, ... } }`
3. Token stored in `localStorage` under key `"token"`
4. Zustand `authStore` holds user state in memory
5. Axios request interceptor attaches `Authorization: Bearer <token>` to every request
6. Axios response interceptor catches `401` → clears token → redirects to `/login`
7. `ProtectedRoute` checks `isAuthenticated` and `user.role` before rendering pages
8. `GuestRoute` redirects already-authenticated users to their role dashboard

---

## Role-Based Access

| Role | Accessible Areas |
|------|-----------------|
| **Public** | Home, Courses, Course Detail |
| **Student** | Student Dashboard, My Courses, Course Learning |
| **Instructor** | Instructor Dashboard, Create/Edit/Manage Courses |
| **Admin** | Admin Dashboard, Manage Users, Manage Courses |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://localhost:5001/api` | Backend API base URL |
| `VITE_APP_NAME` | `LearnHub` | Application display name |

---

## Key Design Decisions

**Lazy loading** — Every page is code-split with `React.lazy()` and wrapped in `Suspense`, keeping the initial bundle small.

**Zustand over Context** — Zustand provides a simpler, boilerplate-free store with built-in persistence support and no provider wrapping.

**Axios interceptors** — Token injection and 401 handling are centralized in `axiosInstance.ts`, keeping all API files clean.

**Role-aware Sidebar** — The `Sidebar` component reads `user.role` from the store and renders the appropriate navigation links without conditional rendering scattered across pages.

**Generic `useApi` hook** — A single hook handles loading, error, and data states for any API call, reducing boilerplate in every page component.
