import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  ArrowRight,
  Eye,
  Edit,
  MessageSquare,
  Settings,
  Star,
  Award,
  Home
} from 'lucide-react';
import { Card, Button, Badge, LoadingSpinner, EmptyState } from '@/components/ui';
import { useAuthStore } from '@/store';
import { useApi } from '@/hooks';
import { coursesApi } from '@/api';
import { formatPrice } from '@/utils';
import type { Course } from '@/types';
import toast from 'react-hot-toast';
import { dashboardApi } from '@/api/dashboard';

type InstructorStats = {
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  totalStudents: number;
  totalCourses: number;
  publishedCourses: number;
  growth: number;
  studentGrowth: number;
  percentile: number;
};

export const InstructorDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const { data: courses, isLoading, refetch } = useApi<Course[]>(
    () => coursesApi.getInstructorCourses(),
    []
  );

  const { data: latestEnrollments } = useApi(
    () => dashboardApi.getLatestEnrollments(),
    []
  );

  const { data: latestReviews } = useApi(
    () => dashboardApi.getLatestReviews(),
    []
  );

  const { data: stats } = useApi<InstructorStats>(
    () => dashboardApi.getStats()
  );


  const safeCourses = courses ?? [];
  const rating = stats?.averageRating ?? 0;
  const totalReviews = stats?.totalReviews ?? 0;
  const publishedCourses = safeCourses.filter((c: any) => c.isPublished);

  const totalStudents = safeCourses.reduce(
    (acc, c: any) => acc + (c.enrollmentCount ?? 0),
    0
  );

  // HANDLE PUBLISH
  const handlePublish = async (courseId: number) => {
    try {
      await coursesApi.publishCourse(courseId);
      toast.success('Course status updated');

      refetch();

    } catch {
      toast.error('Failed to update status');
    }
  };

  const topCourse =
    safeCourses.length > 0
      ? safeCourses.reduce((prev, current) =>
        (prev.enrollmentCount ?? 0) > (current.enrollmentCount ?? 0)
          ? prev
          : current
      )
      : null;

  const worstCourse =
    safeCourses.length > 1
      ? safeCourses.reduce((prev, current) =>
        (prev.enrollmentCount ?? 0) < (current.enrollmentCount ?? 0)
          ? prev
          : current
      )
      : null;


  if (!stats || isLoading) {
    return <LoadingSpinner fullPage text="Loading dashboard..." />;
  }

  return (
    <div className="flex flex-col gap-8 w-full p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Instructor Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Welcome back{user?.firstName ? ', ' : ''}<span className="font-medium text-gray-900 dark:text-gray-300">{user?.firstName}</span>! Here's what's happening with your courses.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 shrink-0">
          <Link to="/">
            <button className="flex items-center justify-center w-full md:w-auto gap-2 bg-white dark:bg-[#181A20] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl px-6 py-3 transition-transform hover:scale-105 active:scale-95 font-semibold">
              <Home className="w-5 h-5" />
              Home
            </button>
          </Link>
          <Link to="/instructor/courses/new">
            <button className="flex items-center justify-center w-full md:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl px-6 py-3 transition-transform hover:scale-105 active:scale-95 font-semibold">
              <PlusCircle className="w-5 h-5" />
              Create New Course
            </button>
          </Link>
        </div>
      </div>

      {/* BENTO STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* REVENUE (HERO WIDGET) */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 border border-indigo-400/20 shadow-2xl shadow-indigo-500/20 group transform-gpu">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 transform-gpu"></div>

          {/* Massive Subtle Watermark */}
          <div className="absolute -bottom-16 -right-16 text-white opacity-[0.03] transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000 ease-out pointer-events-none">
            <DollarSign className="w-96 h-96" />
          </div>

          {/* Floating Glassmorphism Accents */}
          <div className="absolute top-8 right-8 w-32 h-32 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 transform rotate-12 group-hover:rotate-45 group-hover:bg-white/10 transition-all duration-700 pointer-events-none"></div>
          <div className="absolute -top-12 right-32 w-24 h-24 bg-white/5 backdrop-blur-md rounded-full border border-white/10 transform -translate-y-4 group-hover:translate-y-4 transition-transform duration-700 delay-100 pointer-events-none"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-100 font-medium mb-2">
                <DollarSign className="w-5 h-5" /> Total Revenue
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">{formatPrice(stats?.totalRevenue ?? 0)}</h2>
            </div>

            <div className="mt-12 flex items-center justify-between">
              <div className="flex items-center gap-4 bg-white/20 rounded-2xl p-4 w-max border border-white/10 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-400/20 text-emerald-300">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-bold ${stats.growth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {stats.growth >= 0 ? '+' : ''}
                    {stats.growth}%
                  </p>
                  <p className="text-indigo-100 text-xs">Compared to last month</p>
                </div>
              </div>

              {/* Decorative mini bar chart */}
              <div className="hidden sm:flex items-end gap-1.5 h-12 opacity-60">
                {[40, 70, 50, 90, 60, 100].map((h, i) => (
                  <div key={i} className="w-2 bg-white rounded-t-sm group-hover:bg-indigo-100 transition-colors duration-500" style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STUDENTS WIDGET */}
        <div className="relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-gray-800 shadow-lg group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-full
                ${stats.studentGrowth >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                }`}
            >
              {stats.studentGrowth >= 0 ? '+' : ''}
              {stats.studentGrowth}%
            </span>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Students</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalStudents.toLocaleString()}</p>
        </div>

        {/* COURSES WIDGET */}
        <div className="relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-gray-800 shadow-lg group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Active Courses</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{courses?.length ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">{publishedCourses.length} published</p>
        </div>

        {/* RATING WIDGET */}
        <div className="md:col-span-2 relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-gray-800 shadow-lg flex items-center justify-between group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
          <div>
            <div className="flex text-amber-500 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(rating)
                    ? 'fill-current'
                    : 'opacity-20'
                    }`}
                />
              ))}
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Average Rating</h3>
            <p className="text-xs text-gray-400 mt-1">Based on {totalReviews} reviews</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</p>
            <p className="text-xs text-emerald-500 font-medium mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Top {Math.round(100 - stats.percentile)}% of instructors</p>
          </div>

          {/* Mock Radial Progress */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-gray-100 dark:text-gray-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-amber-500 drop-shadow-md" strokeDasharray={`${(stats?.averageRating || 0) * 20}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute text-xl font-bold text-gray-900 dark:text-white">{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: COURSES */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* TOP PERFORMING COURSE */}
          {topCourse && (
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 p-8 group shadow-xl dark:shadow-2xl bg-white dark:bg-[#1C1F26]">
              {/* Background Image / Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 dark:from-[#181A20] via-white/90 dark:via-[#1C1F26]/90 to-transparent z-0"></div>
              {topCourse.thumbnailUrl && (
                <img src={topCourse.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-20 group-hover:scale-105 transition-transform duration-700 transform-gpu will-change-transform" />
              )}

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <Award className="w-4 h-4" /> Top Performing Course
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{topCourse.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#13151A]/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800"><Users className="w-4 h-4 text-gray-500" /> {topCourse.enrollmentCount} Enrolled</span>
                    <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#13151A]/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800"><DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> {formatPrice(topCourse.price * (topCourse.enrollmentCount || 0))} Generated</span>
                  </div>
                </div>
                <Link to={`/instructor/courses/${topCourse.id}/edit`} className="shrink-0">
                  <button className="bg-gray-900 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 font-semibold shadow-xl rounded-xl px-6 py-2.5 whitespace-nowrap transition-transform hover:scale-105">
                    Manage Course
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* LOWEST PERFORMING COURSE */}
          {worstCourse && worstCourse.id !== topCourse?.id && (
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 p-8 group shadow-xl dark:shadow-2xl bg-white dark:bg-[#1C1F26]">
              {/* Background Image / Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 dark:from-red-900/10 via-white/90 dark:via-[#1C1F26]/90 to-transparent z-0"></div>
              {worstCourse.thumbnailUrl && (
                <img src={worstCourse.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-20 group-hover:scale-105 transition-transform duration-700 transform-gpu will-change-transform grayscale" />
              )}

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <TrendingDown className="w-4 h-4" /> Needs Improvement
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{worstCourse.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#13151A]/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800"><Users className="w-4 h-4 text-gray-500" /> {worstCourse.enrollmentCount} Enrolled</span>
                    <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#13151A]/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800"><DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> {formatPrice(worstCourse.price * (worstCourse.enrollmentCount || 0))} Generated</span>
                  </div>
                </div>
                <Link to={`/instructor/courses/${worstCourse.id}/edit`} className="shrink-0">
                  <button className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 font-semibold shadow-md rounded-xl px-6 py-2.5 whitespace-nowrap transition-transform hover:scale-105 border border-red-200 dark:border-red-500/30">
                    Improve Course
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* COURSE CARDS GRID */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h2>
              <Link to="/instructor/courses" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoading ? (
              <LoadingSpinner />
            ) : !courses || courses.length === 0 ? (
              <EmptyState
                title="No courses yet"
                description="Create your first course to start teaching!"
                action={
                  <Link to="/instructor/courses/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">Create Course</Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {courses.slice(0, 4).map((course) => (
                  <div key={course.id} className="group relative bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">

                    {/* Thumbnail Header */}
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                          <BookOpen className="w-12 h-12 opacity-50" />
                        </div>
                      )}

                      {/* Status Badge floating */}
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border ${course.isPublished ? 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-lg shadow-emerald-500/20' : 'bg-gray-900/90 text-gray-200 border-gray-700/50 shadow-lg shadow-black/20'}`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20 transform-gpu will-change-opacity">
                        <button
                          onClick={() => handlePublish(Number(course.id))}
                          className="w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                          title={course.isPublished ? "Unpublish" : "Publish"}
                        >
                          {course.isPublished ? <Eye className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                        </button>
                        <Link to={`/instructor/courses/${course.id}/edit`} className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl" title="Edit Course">
                          <Edit className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 relative z-10 bg-white dark:bg-[#1C1F26]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{course.level}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{course.title}</h3>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-medium">{(course.enrollmentCount ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span className="font-bold">{formatPrice(course.price * (course.enrollmentCount ?? 0))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl p-4 flex flex-col gap-3 shadow-lg dark:shadow-xl">
              <Link to="/instructor/courses/new" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#242832] transition-colors group">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg shadow-indigo-500/0 group-hover:shadow-indigo-500/20">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Create New Course</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Start building a new program</p>
                </div>
              </Link>

              <Link
                to="/instructor/courses"
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#242832] transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Manage Courses
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Edit & organize your content
                  </p>
                </div>
              </Link>

              <Link
                to="/instructor/reviews"
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#242832] transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Student Feedback
                  </p>
                  {latestReviews?.filter((r: any) => !r.instructorReply).length > 0 ? (
                    <span className="text-xs text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md mt-1 inline-block">
                      +{latestReviews.filter((r: any) => !r.instructorReply).length} new to reply
                    </span>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      All caught up!
                    </p>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Simple Recent Reviews block */}
          <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-lg dark:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 relative z-10">Recent Feedback</h3>
            <div className="flex flex-col gap-5 relative z-10">
              {latestReviews?.length === 0 ? (
                <p className="text-sm text-gray-400">No reviews yet</p>
              ) : (
                latestReviews?.map((review: any, index: number) => (
                  <div key={index} className="flex gap-4">

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg">
                      {review.studentName
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>

                    {/* Content */}
                    <div>
                      {/* NAME */}
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {review.studentName}
                      </p>

                      {/* STARS */}
                      <div className="flex text-amber-400 mb-1.5 gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-current' : 'opacity-20'
                              }`}
                          />
                        ))}
                      </div>

                      {/* COMMENT */}
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                        "{review.comment}"
                      </p>

                      {/* COURSE */}
                      <p className="text-xs text-gray-400 mt-1">
                        {review.courseTitle}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Latest Enrollments block */}
          <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-lg dark:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 relative z-10">Latest Enrollments</h3>
            <div className="flex flex-col gap-4 relative z-10">
              {latestEnrollments?.length === 0 ? (
                <p className="text-sm text-gray-400">No recent enrollments</p>
              ) : (
                latestEnrollments?.map((enrollment: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">

                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border">
                      <span className="text-sm font-bold text-gray-600">
                        {enrollment.studentName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {enrollment.studentName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        Enrolled in: {enrollment.courseTitle}
                      </p>
                    </div>
                    <div className="text-xs font-medium text-emerald-600 shrink-0">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}