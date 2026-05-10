import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle, Edit, Eye, Search, BookOpen, Trash,
  Upload, Users, DollarSign, Clock, XCircle, CheckCircle
} from 'lucide-react';
import { Button, LoadingSpinner } from '@/components/ui';
import { useApi } from '@/hooks';
import { coursesApi } from '@/api';
import { formatPrice, getErrorMessage } from '@/utils';
import type { Course } from '@/types';
import toast from 'react-hot-toast';
import { adminApi } from '@/api/adminApi';

// Maps backend status string to badge variant + label
const STATUS_CONFIG: Record<string, { variant: 'success' | 'default' | 'warning' | 'info' | 'danger'; label: string; color: string }> = {
  Published:     { variant: 'success', label: 'Published',       color: 'bg-emerald-500/90 text-white border-emerald-400/50' },
  PendingReview: { variant: 'warning', label: 'Pending Review',  color: 'bg-yellow-500/90 text-white border-yellow-400/50' },
  Rejected:      { variant: 'danger',  label: 'Rejected',        color: 'bg-red-500/90 text-white border-red-400/50' },
  Draft:         { variant: 'default', label: 'Draft',           color: 'bg-gray-900/90 text-gray-200 border-gray-700/50' },
};

export const InstructorCoursesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data, isLoading, refetch } = useApi<Course[]>(
    () => coursesApi.getInstructorCourses(),
    []
  );

  const courses = data ?? [];

  // Use status from backend, fallback to isPublished for older records
  const getCourseStatus = (course: any): string =>
    course.status ?? (course.isPublished ? 'Published' : 'Draft');

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmitForReview = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await adminApi.submitForReview(Number(id));
      if (res.status === 'PendingReview') {
        toast.success('Course submitted for review! The admin will review it shortly.');
      } else if (res.status === 'Draft') {
        toast.success('Submission cancelled.');
      }
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This cannot be undone.')) return;
    setActionLoading(id);
    try {
      await coursesApi.deleteCourse(id);
      toast.success('Course deleted!');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full p-4 md:p-6 lg:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Manage Courses</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {courses.length} total •{' '}
              {courses.filter(c => getCourseStatus(c) === 'Draft').length} drafts •{' '}
              {courses.filter(c => getCourseStatus(c) === 'PendingReview').length} pending review
            </p>
          </div>
        </div>
        <Link to="/instructor/courses/new" className="shrink-0">
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl px-6 py-3 font-semibold transition-transform hover:scale-105">
            <PlusCircle className="w-5 h-5" /> Create New Course
          </button>
        </Link>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg"
        />
      </div>

      {/* COURSES */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center shadow-lg">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {search ? `No results for "${search}"` : 'No courses yet'}
          </h3>
          {!search && (
            <Link to="/instructor/courses/new" className="mt-4 inline-block">
              <Button>Create Your First Course</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((course: any) => {
            const status = getCourseStatus(course);
            const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Draft;
            const isLoading = actionLoading === course.id;

            return (
              <div key={course.id} className="group relative bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">

                {/* THUMBNAIL */}
                <div className="relative h-48 w-full bg-indigo-100 dark:bg-indigo-900/20 overflow-hidden shrink-0">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-300">
                      <BookOpen className="w-16 h-16 opacity-50" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Link to={`/courses/${course.id}`} className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-gray-900 transition-colors" title="Preview">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link to={`/instructor/courses/${course.id}/edit`} className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl" title="Edit">
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button onClick={() => handleDelete(course.id)} disabled={isLoading} className="w-10 h-10 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 transition-all disabled:opacity-50" title="Delete">
                      {isLoading ? <LoadingSpinner size="sm" /> : <Trash className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">{course.level}</span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 flex-1">{course.title}</h3>

                  {/* Rejection reason alert */}
                  {status === 'Rejected' && course.rejectionReason && (
                    <div className="mt-2 mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600 dark:text-red-400">{course.rejectionReason}</p>
                    </div>
                  )}

                  {/* Pending notice */}
                  {status === 'PendingReview' && (
                    <div className="mt-2 mb-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 flex gap-2">
                      <Clock className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">Waiting for admin approval. You can cancel the submission below.</p>
                    </div>
                  )}

                  {/* Published notice */}
                  {status === 'Published' && (
                    <div className="mt-2 mb-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Your course is live and visible to students.</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <Users className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Students</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{(course.enrollmentCount ?? 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-md">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="text-sm font-bold text-emerald-600">{formatPrice(course.price)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action button — changes based on status */}
                  {status === 'Draft' && (
                    <button
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                      onClick={() => handleSubmitForReview(course.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : <><Upload className="w-4 h-4" /> Submit for Review</>}
                    </button>
                  )}

                  {status === 'Rejected' && (
                    <button
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                      onClick={() => handleSubmitForReview(course.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : <><Upload className="w-4 h-4" /> Resubmit for Review</>}
                    </button>
                  )}

                  {status === 'PendingReview' && (
                    <button
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30 rounded-xl font-semibold hover:bg-yellow-100 transition-colors disabled:opacity-50"
                      onClick={() => handleSubmitForReview(course.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : <><XCircle className="w-4 h-4" /> Cancel Submission</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};