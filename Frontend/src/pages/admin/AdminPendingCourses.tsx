import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, BookOpen, Clock, ClipboardCheck } from 'lucide-react';
import { Button, LoadingSpinner, Modal } from '@/components/ui';
import { useApi } from '@/hooks';
import { getErrorMessage, formatPrice } from '@/utils';
import toast from 'react-hot-toast';
import { adminApi } from '@/api/adminApi';

interface PendingCourse {
  id: number;
  title: string;
  thumbnailUrl?: string;
  category: string;
  level: string;
  price: number;
  submittedAt: string;
  instructor: { firstName: string; lastName: string };
}

export const AdminPendingCoursesPage: React.FC = () => {
  const { data: courses, isLoading, refetch } = useApi<PendingCourse[]>(
    () => adminApi.getPendingCourses(),
    []
  );

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingCourse, setRejectingCourse] = useState<PendingCourse | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async (course: PendingCourse) => {
    setActionLoading(course.id);
    try {
      await adminApi.approveCourse(course.id);
      toast.success(`"${course.title}" approved and published!`);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (course: PendingCourse) => {
    setRejectingCourse(course);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectingCourse) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(rejectingCourse.id);
    try {
      await adminApi.rejectCourse(rejectingCourse.id, rejectionReason);
      toast.success(`"${rejectingCourse.title}" rejected. Instructor will be notified.`);
      setShowRejectModal(false);
      setRejectingCourse(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full p-4 md:p-6 lg:p-8 min-h-screen">

      {/* ── HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Pending Course Approvals
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {courses?.length ?? 0} course{courses?.length !== 1 ? 's' : ''} waiting for review
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !courses || courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white dark:bg-[#1C1F26] rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-xl">
          <div className="w-20 h-20 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shadow-inner">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">All caught up!</h3>
            <p className="text-sm font-medium text-gray-500 mt-2">No courses are waiting for approval right now.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group bg-white dark:bg-[#1C1F26] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full pointer-events-none" />
              
              {/* Thumbnail */}
              <div className="w-full sm:w-32 h-40 sm:h-24 rounded-2xl overflow-hidden bg-indigo-100 dark:bg-indigo-900/20 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500 relative z-10">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-indigo-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 relative z-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{course.title}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  by {course.instructor.firstName} {course.instructor.lastName}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl shadow-sm">
                    {course.category}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-xl shadow-sm">
                    {course.level}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl shadow-sm">
                    {formatPrice(course.price)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  Submitted {new Date(course.submittedAt!).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full sm:w-auto relative z-10 mt-4 sm:mt-0">
                <Link to={`/admin/courses/${course.id}/preview`} className="w-full sm:w-auto">
                  <Button size="sm" variant="ghost" className="w-full rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors" leftIcon={<Eye className="w-4 h-4" />}>
                    Preview
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto rounded-xl border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 shadow-sm transition-colors"
                  leftIcon={<XCircle className="w-4 h-4" />}
                  onClick={() => openRejectModal(course)}
                  disabled={actionLoading === course.id}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => handleApprove(course)}
                  isLoading={actionLoading === course.id}
                >
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title={`Reject "${rejectingCourse?.title}"`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button
              variant="danger"
              isLoading={actionLoading === rejectingCourse?.id}
              onClick={handleReject}
            >
              Reject Course
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The instructor will see this reason on their course card so they know what to fix before resubmitting.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Course content is incomplete, missing lesson videos in section 2..."
            rows={4}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </Modal>
    </div>
  );
};