import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Play, Search, Compass, Award } from 'lucide-react';
import { LoadingSpinner, EmptyState, Button } from '@/components/ui';
import { useApi } from '@/hooks';
import { coursesApi } from '@/api';
import type { Enrollment } from '@/types';

type FilterTab = 'all' | 'in-progress' | 'completed' | 'not-started';

export const MyCoursesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const { data: enrollments, isLoading } = useApi<Enrollment[]>(
    () => coursesApi.getMyEnrollments(),
    []
  );

  const normallizedSearch = search.trim().toLowerCase();
  const filtered = (enrollments ?? [])
    .filter((e) => {
      const matchesSearch = e.course?.title?.toLowerCase().includes(normallizedSearch);
      if (!matchesSearch) return false;

      switch (activeTab) {
        case 'in-progress':
          return e.progress > 0 && e.progress < 100;
        case 'completed':
          return e.progress === 100;
        case 'not-started':
          return e.progress === 0;
        default:
          return true;
      }
    })
    .sort((a, b) => b.progress - a.progress);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All Courses', count: enrollments?.length ?? 0 },
    {
      key: 'in-progress',
      label: 'In Progress',
      count: enrollments?.filter((e) => e.progress > 0 && e.progress < 100).length ?? 0,
    },
    {
      key: 'completed',
      label: 'Completed',
      count: enrollments?.filter((e) => e.progress === 100).length ?? 0,
    },
    {
      key: 'not-started',
      label: 'Not Started',
      count: enrollments?.filter((e) => e.progress === 0).length ?? 0,
    },
  ];

  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading your courses..." />;
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
              My Courses
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              You are currently enrolled in {enrollments?.length ?? 0} active courses.
            </p>
          </div>
        </div>

        <Link to="/courses" className="shrink-0">
          <button className="flex items-center justify-center w-full md:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl px-6 py-3 transition-transform hover:scale-105 active:scale-95 font-semibold">
            <Compass className="w-5 h-5" />
            Find More Courses
          </button>
        </Link>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white dark:bg-[#1C1F26] p-4 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        
        {/* Tabs */}
        <div className="flex w-full xl:w-auto gap-2 overflow-x-auto p-1 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-gray-900 text-white shadow-md dark:bg-gray-100 dark:text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
            >
              {tab.label}
              <span
                className={`flex items-center justify-center h-5 min-w-[20px] rounded-full px-1.5 text-xs font-bold ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white dark:bg-black/10 dark:text-gray-900'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full xl:w-96 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#13151A] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white dark:placeholder-gray-500 transition-all shadow-inner"
            placeholder="Search your courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* COURSE GRID */}
      {filtered.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'all' && !search.trim()
              ? "You haven't enrolled in any courses yet"
              : 'No courses match your filter'
          }
          description={
            activeTab === 'all' && !search.trim()
              ? 'Browse our catalog and start learning today!'
              : 'Try a different filter or search term.'
          }
          action={
            activeTab === 'all' && !search.trim() ? (
              <Link to="/courses">
                <Button className="bg-indigo-600 hover:bg-indigo-700">Browse Catalog</Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={() => { setActiveTab('all'); setSearch(''); }}>
                Clear Filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((enrollment) => (
            <div key={enrollment.id} className="group relative bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              
              {/* Thumbnail Header */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                {enrollment.course?.thumbnailUrl ? (
                  <img src={enrollment.course.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                    <BookOpen className="w-12 h-12 opacity-50" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg ${
                    enrollment.progress === 100 
                      ? 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-emerald-500/20' 
                      : enrollment.progress > 0 
                      ? 'bg-amber-500/90 text-white border-amber-400/50 shadow-amber-500/20' 
                      : 'bg-gray-900/90 text-white border-gray-700/50 shadow-black/20'
                  }`}>
                    {enrollment.progress === 100 ? 'Completed' : enrollment.progress > 0 ? 'In Progress' : 'Not Started'}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20 transform-gpu will-change-opacity">
                  <Link to={enrollment.lastLessonId ? `/student/courses/${enrollment.courseId}/learn?lesson=${enrollment.lastLessonId}` : `/student/courses/${enrollment.courseId}/learn`} className="w-16 h-16 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition-transform shadow-2xl pl-1" title="Resume">
                    <Play className="w-7 h-7" fill="currentColor" />
                  </Link>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 relative z-10 bg-white dark:bg-[#1C1F26] flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{enrollment.course?.level}</span>
                  {enrollment.progress === 100 && <Award className="w-4 h-4 text-emerald-500" />}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {enrollment.course?.title}
                </h3>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Progress</span>
                    <span className={`text-sm font-bold ${enrollment.progress === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                      {enrollment.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${enrollment.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-500'}`} style={{ width: `${enrollment.progress}%` }}></div>
                  </div>
                </div>

                {/* Additional Action Bottom Row for 100% completed courses */}
                {enrollment.progress === 100 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2">
                    <Link to={`/student/courses/${enrollment.courseId}/learn`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full py-1 h-8 rounded-lg text-xs font-semibold">Review</Button>
                    </Link>
                    <Link to={`/student/certificates/${enrollment.courseId}`} className="w-full">
                      <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-500/20 py-1 h-8 rounded-lg text-xs font-semibold">
                        Certificate
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
