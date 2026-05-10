import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2, Eye, X, BookOpen, Star, DollarSign, ChevronDown, Check, Rocket, Archive, Edit3 } from 'lucide-react';
import { Button, LoadingSpinner, EmptyState, Modal } from '@/components/ui';
import { coursesApi } from '@/api';
import { getErrorMessage, formatPrice } from '@/utils';
import toast from 'react-hot-toast';

interface AdminCourse {
  id: string;
  title: string;
  thumbnailUrl?: string;
  instructor: { firstName: string; lastName: string };
  status: string;
  enrollmentCount: number;
  price: number;
  revenue: number;
  level: string;
  category: string;
  rating: number;
}

const LEVEL_STYLES: Record<string, string> = {
  Beginner:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Intermediate: 'bg-yellow-100  text-yellow-700  dark:bg-yellow-500/10  dark:text-yellow-400',
  Advanced:     'bg-red-100     text-red-700     dark:bg-red-500/10     dark:text-red-400',
};

// ── Stunning Table Status Popover
const TableStatusDropdown: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}> = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#181A20] hover:bg-gray-50 dark:hover:bg-[#242832] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all min-w-[110px] shadow-sm"
      >
        <span className="flex items-center gap-1.5">
          {value === 'Published' && <Rocket className="w-3.5 h-3.5 text-emerald-500" />}
          {value === 'Draft' && <Edit3 className="w-3.5 h-3.5 text-gray-400" />}
          {value === 'Archived' && <Archive className="w-3.5 h-3.5 text-amber-500" />}
          {selected ? selected.label : value}
        </span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-white/95 dark:bg-[#181A20]/95 backdrop-blur-2xl border border-white/50 dark:border-gray-700/50 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
             <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Update Status</span>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {options.map((opt) => {
              const icons = {
                Draft: <Edit3 className="w-5 h-5" />,
                Published: <Rocket className="w-5 h-5" />,
                Archived: <Archive className="w-5 h-5" />
              };
              const isCurrent = value === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`flex items-center gap-4 p-3 w-full rounded-2xl transition-all duration-300 group
                    ${isCurrent 
                      ? 'bg-indigo-600 shadow-xl shadow-indigo-500/30 text-white translate-x-1' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:translate-x-1'}`}
                >
                  <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-500 ${isCurrent ? 'bg-white/20 text-white shadow-inner' : 'bg-gray-100 dark:bg-gray-900 text-gray-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10'}`}>
                    {icons[opt.value as keyof typeof icons]}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{opt.label}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${isCurrent ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {opt.value === 'Published' ? 'Visible to students' : opt.value === 'Draft' ? 'Hidden from public' : 'Legacy hidden course'}
                    </p>
                  </div>
                  {isCurrent && (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-in zoom-in">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    coursesApi.getCategories().then(data => {
      setCategories(data.map((c: any) => c.name));
    }).catch(() => {});
  }, []);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<AdminCourse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 10;

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await coursesApi.adminGetAllCourses({
        page,
        pageSize,
        search: search || undefined,
        category: category || undefined,
      });
      setCourses(data.data);
      setTotal(data.totalCount); // ✅ fixed from data.total
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, search, category]);

  const handleStatusChange = async (courseId: string, status: string) => {
    try {
      await coursesApi.adminUpdateCourseStatus(courseId, status);
      toast.success('Course status updated');
      fetchCourses();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await coursesApi.adminDeleteCourse(courseToDelete.id);
      toast.success('Course deleted');
      setShowDeleteModal(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

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
              Manage Courses
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {total} total courses available
            </p>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white/90 dark:bg-[#1C1F26]/90 backdrop-blur-xl p-3.5 rounded-[2rem] border border-gray-200/60 dark:border-gray-800/60 shadow-lg flex flex-col xl:flex-row gap-4 items-center relative z-10 overflow-x-auto hide-scrollbar">
        <div className="flex-1 w-full relative group min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search courses by title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#181A20] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Unique Category Segmented Control */}
        <div className="flex bg-gray-100/80 dark:bg-[#13151A]/80 p-1.5 rounded-[1.25rem] w-full xl:w-auto shadow-inner border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-md relative overflow-x-auto hide-scrollbar">
          <div className="flex gap-1 min-w-max">
            {['', ...categories].map((cat) => {
              const isActive = category === cat;
              return (
                <button
                  key={cat || 'all'}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 ease-out z-10 ${
                    isActive
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-white dark:bg-[#1C1F26] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-700/50 -z-10" />
                  )}
                  <span className="relative z-10">{cat || 'All Categories'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : courses.length === 0 ? (
        <EmptyState title="No courses found" description="Try adjusting your search or filters." />
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1F26] shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800/50">
              <thead className="bg-gray-50/80 dark:bg-gray-800/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Course</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Instructor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Level</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Students</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Revenue</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/30">
                {courses.map((course) => (
                  <tr key={course.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors">

                    {/* Course */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-100 dark:bg-indigo-900/30 group-hover:shadow-md transition-shadow">
                          {course.thumbnailUrl ? (
                            <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 max-w-[200px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{course.title}</p>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{course.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* Instructor */}
                    <td className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {course.instructor?.firstName} {course.instructor?.lastName}
                    </td>

                    {/* Level Badge */}
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${LEVEL_STYLES[course.level] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {course.level ?? '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <TableStatusDropdown
                        value={course.status}
                        onChange={(val) => handleStatusChange(course.id, val)}
                        options={[
                          { label: 'Draft', value: 'Draft' },
                          { label: 'Published', value: 'Published' },
                          { label: 'Archived', value: 'Archived' },
                        ]}
                      />
                    </td>

                    {/* Students */}
                    <td className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {course.enrollmentCount.toLocaleString()}
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg w-max">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                          {course.rating > 0 ? course.rating.toFixed(1) : '—'}
                        </span>
                      </div>
                    </td>

                    {/* Revenue */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <DollarSign className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatPrice(course.revenue)}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/courses/${course.id}`}>
                          <button className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => { setCourseToDelete(course); setShowDeleteModal(true); }}
                          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 px-6 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Course"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDeleteConfirm}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Are you sure you want to delete <strong>"{courseToDelete?.title}"</strong>?
          This will remove the course and all enrollments permanently.
        </p>
      </Modal>
    </div>
  );
};