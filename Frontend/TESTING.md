# Testing Guide — Mock Authentication

This guide explains how to test all pages and roles **without a backend**.

---

## Quick Start

### 1. Start the Dev Server

```bash
pnpm dev
```

The app will open at `http://localhost:5173`.

### 2. Use the Mock Auth Toggle

In the **bottom-right corner**, you'll see a purple button labeled with the current role. Click it to open the role switcher.

![Mock Auth Toggle Location](./public/mock-auth-location.png)

---

## Available Mock Roles

| Role | Email | Purpose |
|------|-------|---------|
| **Public** | (none) | Browse home, courses, course details (no auth required) |
| **Student** | `student@example.com` | Access student dashboard, my courses, course learning |
| **Instructor** | `instructor@example.com` | Access instructor dashboard, create/manage courses |
| **Admin** | `admin@example.com` | Access admin dashboard, manage users, manage courses |

---

## Testing Each Page

### Public Pages (No Auth Required)

These work without switching roles:

1. **Home Page** — `http://localhost:5173/`
   - Hero section, features, featured courses
   - No backend calls, all static content

2. **Courses Page** — `http://localhost:5173/courses`
   - Course catalog with search/filter
   - **Note**: Will show empty or error because API calls fail (no backend)
   - To see mock data, you'll need to add mock API responses (see below)

3. **Course Detail** — `http://localhost:5173/courses/1`
   - Full course information
   - **Note**: Will error without backend

---

### Student Pages

1. **Switch to Student role** using the toggle
2. Navigate to `http://localhost:5173/student/dashboard`
   - Dashboard with stats and continue learning section
   - Mock data will display

3. **My Courses** — `http://localhost:5173/student/my-courses`
   - List of enrolled courses
   - Filter tabs (all, in-progress, completed)

4. **Course Learning** — `http://localhost:5173/student/courses/1/learn`
   - Full-screen lesson viewer
   - Collapsible curriculum sidebar
   - Mark lesson complete button

---

### Instructor Pages

1. **Switch to Instructor role** using the toggle
2. Navigate to `http://localhost:5173/instructor/dashboard`
   - Dashboard with course stats table

3. **My Courses** — `http://localhost:5173/instructor/courses`
   - List of instructor's courses

4. **Create Course** — `http://localhost:5173/instructor/courses/new`
   - 3-step course creation wizard
   - Form validation works locally

5. **Manage Course** — `http://localhost:5173/instructor/courses/1/edit`
   - Edit course details
   - Publish/unpublish buttons

---

### Admin Pages

1. **Switch to Admin role** using the toggle
2. Navigate to `http://localhost:5173/admin/dashboard`
   - Platform-wide statistics
   - Recent users and courses tables

3. **Manage Users** — `http://localhost:5173/admin/users`
   - Paginated user table
   - Role change dropdown
   - Delete button

4. **Manage Courses** — `http://localhost:5173/admin/courses`
   - Paginated course table
   - Status badges
   - Delete button

---

## How Mock Auth Works

### What's Stored

When you switch to a role, the mock user data is stored in **Zustand store** and **localStorage**:

```javascript
// Example: Student user object
{
  id: "student-001",
  email: "student@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "Student",
  createdAt: "2024-01-01T00:00:00Z"
}
```

### Persistence

- User state persists across page refreshes (stored in `localStorage`)
- Token is **not** set (since there's no backend to validate it)
- You can manually clear it by clicking **Logout** in the toggle

### Clearing Mock Auth

1. Click the purple toggle button
2. Click **Logout**
3. You'll be redirected to the home page as a public user

Or manually clear localStorage:

```javascript
// In browser console
localStorage.removeItem('auth-storage');
location.reload();
```

---

## Adding Mock API Data

If you want to test pages that make API calls (Courses, My Courses, etc.), you can add mock responses using **MSW (Mock Service Worker)** or create a simple mock interceptor.

### Option 1: Use Browser DevTools

1. Open DevTools (F12)
2. Go to **Network** tab
3. Right-click a failed request → **Edit and Replay**
4. Modify the response to return mock data

### Option 2: Create Mock API Responses (Recommended)

Create a file `src/api/mockResponses.ts`:

```typescript
export const mockCourses = [
  {
    id: '1',
    title: 'React Fundamentals',
    description: 'Learn React from scratch',
    instructor: 'Jane Smith',
    price: 49.99,
    rating: 4.8,
    students: 1250,
    image: 'https://via.placeholder.com/300x200',
    category: 'Web Development',
    level: 'Beginner',
    duration: '12 hours',
    sections: 8,
  },
  // Add more courses...
];
```

Then in `src/api/courses.ts`, add a check:

```typescript
export const coursesApi = {
  getAll: async (params?: any) => {
    // In development, return mock data
    if (import.meta.env.DEV) {
      return { data: mockCourses, total: mockCourses.length };
    }
    // Otherwise, call real API
    const response = await axiosInstance.get('/courses', { params });
    return response.data;
  },
};
```

---

## Testing Role-Based Access

### Unauthorized Access

Try accessing pages you shouldn't have access to:

1. **As Student**: Try to access `/admin/dashboard` → redirects to `/unauthorized`
2. **As Instructor**: Try to access `/student/dashboard` → redirects to `/unauthorized`
3. **As Public**: Try to access `/student/dashboard` → redirects to `/login`

### Protected Routes

- Public pages (`/`, `/courses`, `/courses/:id`) work for everyone
- Student pages require `Student` role
- Instructor pages require `Instructor` role
- Admin pages require `Admin` role

---

## Disabling Mock Auth in Production

The `MockAuthToggle` only appears in **development mode** (`import.meta.env.DEV`).

In production builds:
```bash
pnpm build
```

The toggle will **not** be included in the bundle.

---

## Troubleshooting

### Toggle Not Appearing

- Make sure you're running `pnpm dev` (development mode)
- Check browser console for errors
- Verify `src/components/dev/MockAuthToggle.tsx` exists

### Role Change Not Working

- Check browser console for errors
- Verify localStorage is not disabled
- Try clearing localStorage and refreshing

### Pages Still Show "Loading"

- Check if API calls are failing (Network tab in DevTools)
- Add mock data using the methods above
- Or wait for backend to be ready

---

## Next Steps

When your **ASP.NET Core backend** is ready:

1. Update `VITE_API_URL` in `.env` to point to your backend
2. Remove or comment out the mock data
3. The app will automatically use real API calls
4. Remove the `MockAuthToggle` component (or leave it for debugging)

---

## Questions?

Refer to the main `README.md` for architecture details and API contract information.
