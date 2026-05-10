import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  ArrowRight,
  Play,
  Heart,
  Flame,
  CheckCircle,
  Compass,
  MonitorPlay,
  Home
} from 'lucide-react';

import { LoadingSpinner, EmptyState, Button } from '@/components/ui';
import { useAuthStore } from '@/store';
import { useApi } from '@/hooks';
import { coursesApi } from '@/api';
import { formatDuration } from '@/utils';
import type { Enrollment } from '@/types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const { data: enrollments, isLoading } = useApi<Enrollment[]>(
    () => coursesApi.getMyEnrollments(),
    []
  );

  const { data: streak } = useApi<number>(
    () => coursesApi.getLearningStreak(),
    []
  );

  const recentlyAccessed = (enrollments ?? [])
    .filter(e => e.lastAccessedAt)
    .sort((a, b) => new Date(b.lastAccessedAt!).getTime() - new Date(a.lastAccessedAt!).getTime())
    .slice(0, 6);

  const inProgress = enrollments?.filter((e) => e.progress > 0 && e.progress < 100) ?? [];
  const completed = enrollments?.filter((e) => e.progress === 100) ?? [];
  const totalHours = enrollments?.reduce((acc, e) => acc + (e.course?.totalDuration ?? 0), 0) ?? 0;

  const currentCourse = inProgress.length > 0 ? inProgress[0] : recentlyAccessed[0] || null;

  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading dashboard..." />;
  }

  return (
    <div className="flex flex-col gap-8 w-full p-4 md:p-6 lg:p-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Student Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Welcome back{user?.firstName ? ', ' : ''}<span className="font-medium text-gray-900 dark:text-gray-300">{user?.firstName}</span>! Here's your learning progress.
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
          <Link to="/courses">
            <button className="flex items-center justify-center w-full md:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl px-6 py-3 transition-transform hover:scale-105 active:scale-95 font-semibold">
              <Compass className="w-5 h-5" />
              Browse Catalog
            </button>
          </Link>
        </div>
      </div>

      {/* BENTO STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* STREAK (HERO WIDGET) */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 border border-orange-400/20 shadow-2xl shadow-orange-500/20 group transform-gpu">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 transform-gpu"></div>

          {/* Massive Subtle Watermark */}
          <div className="absolute -bottom-16 -right-16 text-white opacity-[0.05] transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000 ease-out pointer-events-none">
            <Flame className="w-96 h-96" />
          </div>

          {/* Floating Glassmorphism Accents */}
          <div className="absolute top-8 right-8 w-32 h-32 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 transform rotate-12 group-hover:rotate-45 group-hover:bg-white/20 transition-all duration-700 pointer-events-none"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-100 font-bold uppercase tracking-wider mb-2 text-sm">
                <Flame className="w-5 h-5 text-amber-300" /> Learning Streak
              </div>
              <div className="flex items-baseline gap-2 mt-4">
                <h2 className="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none">{streak ?? 0}</h2>
                <span className="text-2xl font-bold text-orange-200">Days</span>
              </div>
            </div>

            <div className="mt-8">
              <div className="inline-block bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium px-4 py-2 rounded-xl shadow-lg">
                {streak && streak > 0 ? "🔥 You're on fire! Keep it up!" : "🚀 Start your streak today!"}
              </div>
            </div>
          </div>
        </div>

        {/* ENROLLED WIDGET */}
        <div className="relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-gray-800 shadow-lg group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Enrolled</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{enrollments?.length ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">{inProgress.length} currently active</p>
        </div>

        {/* COMPLETED WIDGET */}
        <div className="relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-gray-800 shadow-lg group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Courses Completed</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{completed.length}</p>
        </div>

        {/* LEARNING HOURS WIDGET */}
        <div className="md:col-span-2 relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-gray-800 shadow-lg flex items-center justify-between group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
          <div>
            <div className="flex text-purple-500 mb-4">
              <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Learning Time</h3>
            <p className="text-xs text-gray-400 mt-1">Estimated hours of content</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{formatDuration(totalHours).replace(' hours', 'h')}</p>
          </div>

          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-gray-100 dark:text-gray-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-indigo-500 drop-shadow-md" strokeDasharray="75, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute text-indigo-500"><TrendingUp className="w-8 h-8" /></div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: COURSES */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* RESUME LEARNING */}
          {currentCourse && (
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 p-8 group shadow-xl dark:shadow-2xl bg-white dark:bg-[#1C1F26]">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 dark:from-indigo-900/10 via-white/90 dark:via-[#1C1F26]/90 to-transparent z-0"></div>
              {currentCourse.course?.thumbnailUrl && (
                <img src={currentCourse.course.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-20 group-hover:scale-105 transition-transform duration-700 transform-gpu will-change-transform grayscale" />
              )}

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <MonitorPlay className="w-4 h-4" /> Jump Back In
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{currentCourse.course?.title}</h3>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Course Progress</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{currentCourse.progress}%</span>
                    </div>
                    <div className="w-full max-w-sm h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" style={{ width: `${currentCourse.progress}%` }}></div>
                    </div>
                  </div>
                </div>
                <Link to={currentCourse.lastLessonId ? `/student/courses/${currentCourse.courseId}/learn?lesson=${currentCourse.lastLessonId}` : `/student/courses/${currentCourse.courseId}/learn`} className="shrink-0">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xl shadow-indigo-500/20 rounded-xl px-6 py-3 whitespace-nowrap transition-transform hover:scale-105 flex items-center gap-2">
                    <Play className="w-4 h-4" fill="currentColor" /> Continue Learning
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* MY COURSES GRID */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Courses</h2>
              <Link to="/student/my-courses" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {!inProgress || inProgress.length === 0 ? (
              <EmptyState
                title="No active courses"
                description="Browse our catalog to start learning!"
                action={<Link to="/courses"><Button className="bg-indigo-600 hover:bg-indigo-700">Browse Catalog</Button></Link>}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {inProgress.slice(0, 4).map((enrollment) => (
                  <div key={enrollment.id} className="group relative bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    
                    {/* Thumbnail Header */}
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {enrollment.course?.thumbnailUrl ? (
                        <img src={enrollment.course.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                          <BookOpen className="w-12 h-12 opacity-50" />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border bg-amber-500/90 text-white border-amber-400/50 shadow-lg shadow-amber-500/20">
                          In Progress
                        </span>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20 transform-gpu will-change-opacity">
                        <Link to={enrollment.lastLessonId ? `/student/courses/${enrollment.courseId}/learn?lesson=${enrollment.lastLessonId}` : `/student/courses/${enrollment.courseId}/learn`} className="w-14 h-14 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition-transform shadow-xl pl-1" title="Resume">
                          <Play className="w-6 h-6" fill="currentColor" />
                        </Link>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 relative z-10 bg-white dark:bg-[#1C1F26]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{enrollment.course?.level}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{enrollment.course?.title}</h3>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="w-full flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">{enrollment.progress}%</span>
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
              <Link to="/courses" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#242832] transition-colors group">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg shadow-indigo-500/0 group-hover:shadow-indigo-500/20">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Browse Catalog</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Discover new skills</p>
                </div>
              </Link>

              <Link to="/student/my-list" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#242832] transition-colors group">
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">My List</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Saved courses for later</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Achievements Block */}
          <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-lg dark:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 relative z-10">Recent Achievements</h3>
            <div className="flex flex-col gap-5 relative z-10">
              {completed.length === 0 ? (
                <p className="text-sm text-gray-400">Complete a course to see achievements</p>
              ) : (
                completed.slice(0, 4).map((enrollment, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {enrollment.course?.title}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </p>
                    </div>
                    <Link to={`/student/certificates/${enrollment.courseId}`} className="shrink-0 text-indigo-600 hover:text-indigo-500">
                      <Button size="sm" variant="outline" className="text-xs py-1 h-8 rounded-lg">Certificate</Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};