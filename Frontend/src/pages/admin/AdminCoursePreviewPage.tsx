import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Users,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Play,
  Lock,
  Star,
  Globe,
  Award,
  BarChart2,
  ArrowLeft,
  ShieldCheck,
  FileText,
  X,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui';
import { useApi } from '@/hooks';
import { formatPrice, formatDuration } from '@/utils';
import { adminApi } from '@/api/adminApi';

export const AdminCoursePreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState<any | null>(null);

  if (!id) return null;

  const { data: course, isLoading, error } = useApi(
    () => adminApi.previewCourse(Number(id)),
    [id]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (course?.sections?.length) {
      setExpandedSections(new Set([course.sections[0].id]));
    }
  }, [course]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const handleLessonClick = (lesson: any) => {
    setActiveLesson((prev: any) => (prev?.id === lesson.id ? null : lesson));
  };

  const formattedUpdatedAt = course?.updatedAt
    ? new Date(course.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

  if (isLoading) return <LoadingSpinner fullPage text="Loading course preview..." />;

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <BookOpen className="h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-700">Course not found</h2>
        <button
          onClick={() => navigate('/admin/pending-courses')}
          className="text-indigo-600 font-bold hover:underline"
        >
          ← Back to Pending Approvals
        </button>
      </div>
    );
  }

  const totalLessons =
    course.sections?.reduce((acc: number, s: any) => acc + s.lessons.length, 0) ??
    course.totalLessons;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] transition-colors duration-300">

      {/* ─── ADMIN BANNER ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-amber-500 text-amber-950 px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <p className="text-sm font-black">
            Admin Preview — Click any lesson below to watch videos or view PDFs before approving.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/pending-courses')}
          className="flex items-center gap-2 text-sm font-black bg-amber-950/10 hover:bg-amber-950/20 px-4 py-2 rounded-xl transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Approvals
        </button>
      </div>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#0F1115] pt-15 pb-32">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 items-center">

            {/* Hero Content */}
            <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
              <nav className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-500">
                <Link to="/admin/pending-courses" className="hover:text-white transition-colors">
                  Pending Approvals
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-indigo-400">{course.categoryName}</span>
              </nav>

              <h1 className="text-4xl md:text-6xl font-black leading-tight text-white tracking-tight">
                {course.title}
              </h1>

              <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
                {course.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-base font-black text-white">{course.rating?.toFixed(1) || 'New'}</span>
                  <span className="text-xs font-bold text-gray-500">({course.reviewCount || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="text-base font-black text-white">{(course.enrollmentCount ?? 0).toLocaleString()}</span>
                  <span className="text-xs font-bold text-gray-500">Students</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-base font-black text-white">{course.level}</span>
                  <span className="text-xs font-bold text-gray-500">Level</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-base font-black text-white">{formatDuration(course.totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                  <Award className="w-4 h-4 text-rose-400" />
                  <span className="text-base font-black text-white">Certificate</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-base font-black text-white">{formattedUpdatedAt}</span>
                  <span className="text-xs font-bold text-gray-500">Last Updated</span>
                </div>
              </div>

              {course.instructor && (
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-xl shadow-indigo-600/20 overflow-hidden">
                    {course.instructor.profileImageUrl ? (
                      <img
                        src={course.instructor.profileImageUrl}
                        alt={course.instructor.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      course.instructor.firstName.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Lead Instructor</p>
                    <p className="text-base font-bold text-white">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Preview Card */}
            <div className="lg:col-span-4 animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="relative group overflow-hidden rounded-[2.5rem] bg-[#1C1F26] border border-white/10 shadow-2xl shadow-black/50 p-3">
                <div className="relative aspect-video overflow-hidden rounded-[1.8rem]">
                  <img
                    src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-white">{formatPrice(course.price)}</span>
                    <div className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                      Pending Review
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/admin/pending-courses')}
                    className="w-full py-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    ✓ Go Approve / Reject
                  </button>
                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Course Includes</p>
                    <div className="grid grid-cols-1 gap-3 text-xs text-gray-400 font-bold">
                      <div className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-indigo-500" />Full Lifetime Access</div>
                      <div className="flex items-center gap-2.5"><Globe className="w-4 h-4 text-indigo-500" />{course.language || 'English'}</div>
                      <div className="flex items-center gap-2.5"><Award className="w-4 h-4 text-indigo-500" />Certificate of Completion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12 xl:px-16 py-20">

        {/* Description + Instructor */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-4 mb-16">
          <section className="col-span-3 bg-gray-50 dark:bg-[#1C1F26] rounded-[3rem] p-8 lg:p-14 border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">About This Course</h2>
            </div>
            <p className="whitespace-pre-line text-lg leading-relaxed text-gray-600 dark:text-gray-400 font-bold">
              {course.description}
            </p>
          </section>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="p-8 flex flex-col relative">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full" />
              <div className="flex items-center justify-between mb-6 z-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Instructor</h3>
              </div>
              <div className="flex flex-col items-center text-center z-10">
                <div className="relative mb-6">
                  <div className="w-28 h-28 rounded-full border-4 border-indigo-500/20 p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center text-white text-3xl font-black">
                      {course.instructor?.profileImageUrl ? (
                        <img src={course.instructor.profileImageUrl} className="w-full h-full object-cover" />
                      ) : (
                        course.instructor?.firstName?.charAt(0) ?? '?'
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black p-2 rounded-full shadow-md">
                    <Award className="w-4 h-4 text-indigo-500" />
                  </div>
                </div>
                <h4 className="text-2xl font-black text-gray-900 dark:text-white">
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </h4>
                {course.instructor?.bio && (
                  <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
                    {course.instructor.bio.length > 120
                      ? course.instructor.bio.slice(0, 120) + '...'
                      : course.instructor.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── CURRICULUM WITH INLINE VIEWER ───────────────────────────────── */}
        {course.sections && course.sections.length > 0 && (
          <section className="py-20 border-t border-gray-100 dark:border-gray-800">
            <div className="max-w-5xl mx-auto space-y-8">

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Course Curriculum</h2>
                  <p className="mt-2 text-base text-gray-500 font-medium">
                    Click any lesson to watch the video or view the PDF inline.
                  </p>
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-6 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                  {course.sections.length} Sections · {totalLessons} Lessons
                </span>
              </div>

              <div className="space-y-4 pt-4">
                {course.sections.map((section: any, idx: number) => (
                  <div
                    key={section.id}
                    className={`overflow-hidden rounded-[2rem] border transition-all ${
                      expandedSections.has(section.id)
                        ? 'border-indigo-500 shadow-xl shadow-indigo-500/10'
                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1C1F26]'
                    }`}
                  >
                    {/* Section header */}
                    <button
                      className={`flex w-full items-center justify-between px-8 py-6 text-left transition-colors ${
                        expandedSections.has(section.id)
                          ? 'bg-indigo-50/50 dark:bg-indigo-900/10'
                          : 'hover:bg-gray-50 dark:hover:bg-[#1C1F26]/80'
                      }`}
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-sm ${
                          expandedSections.has(section.id)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="text-lg font-black text-gray-900 dark:text-white">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400 hidden sm:inline-block">
                          {section.lessons.length} Lessons
                        </span>
                        {expandedSections.has(section.id)
                          ? <ChevronDown className="h-5 w-5 text-indigo-500" />
                          : <ChevronRight className="h-5 w-5 text-gray-400" />}
                      </div>
                    </button>

                    {/* Lessons */}
                    {expandedSections.has(section.id) && (
                      <div className="bg-white dark:bg-[#0F1115] divide-y divide-gray-100 dark:divide-gray-800 animate-in slide-in-from-top-4 duration-300">
                        {section.lessons.map((lesson: any) => {
                          const isActive = activeLesson?.id === lesson.id;
                          const hasVideo = !!lesson.videoUrl;
                          const hasPdf = !!lesson.fileUrl;

                          return (
                            <div key={lesson.id}>

                              {/* Lesson row */}
                              <div
                                className={`flex items-center justify-between px-8 py-5 cursor-pointer transition-colors group ${
                                  isActive
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                                onClick={() => handleLessonClick(lesson)}
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                    isActive
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                                  }`}>
                                    <Play className="h-4 w-4 fill-current" />
                                  </div>

                                  <span className={`text-sm font-bold truncate transition-colors ${
                                    isActive
                                      ? 'text-indigo-600 dark:text-indigo-400'
                                      : 'text-gray-700 dark:text-gray-300 group-hover:text-indigo-600'
                                  }`}>
                                    {lesson.title}
                                  </span>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {hasVideo && (
                                      <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-1">
                                        <Play className="w-2.5 h-2.5" /> Video
                                      </span>
                                    )}
                                    {hasPdf && (
                                      <span className="rounded-full bg-rose-100 dark:bg-rose-900/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-1">
                                        <FileText className="w-2.5 h-2.5" /> PDF
                                      </span>
                                    )}
                                    {lesson.isPreview ? (
                                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                        Free Preview
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                        <Lock className="w-2.5 h-2.5" /> Enrolled Only
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                  <span className="text-xs font-bold text-gray-400">
                                    {formatDuration(lesson.durationInMinutes || 0)}
                                  </span>
                                  {isActive
                                    ? <X className="w-4 h-4 text-indigo-400" />
                                    : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />}
                                </div>
                              </div>

                              {/* ─── INLINE CONTENT VIEWER ───────────────── */}
                              {isActive && (
                                <div className="px-8 py-6 bg-gray-50 dark:bg-[#0A0C10] border-t border-indigo-100 dark:border-indigo-900/30 space-y-6 animate-in slide-in-from-top-2 duration-300">

                                  {/* Text content */}
                                  {lesson.content && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                                      {lesson.content}
                                    </p>
                                  )}

                                  {/* Video player */}
                                  {hasVideo && (
                                    <div className="space-y-2">
                                      <p className="text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-1.5">
                                        <Play className="w-3 h-3" /> Video
                                      </p>
                                      <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl">
                                        <video
                                          key={lesson.videoUrl}
                                          controls
                                          className="w-full h-full"
                                          src={lesson.videoUrl}
                                        >
                                          Your browser does not support the video tag.
                                        </video>
                                      </div>
                                    </div>
                                  )}

                                  {/* PDF viewer */}
                                  {hasPdf && (
                                    <div className="space-y-2">
                                      <p className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-1.5">
                                        <FileText className="w-3 h-3" /> PDF File
                                      </p>
                                      <div
                                        className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl"
                                        style={{ height: '600px' }}
                                      >
                                        <iframe
                                          src={lesson.fileUrl}
                                          className="w-full h-full"
                                          title={lesson.title}
                                        />
                                      </div>
                                      <a
                                        href={lesson.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        Open PDF in new tab
                                      </a>
                                    </div>
                                  )}

                                  {/* No content fallback */}
                                  {!hasVideo && !hasPdf && !lesson.content && (
                                    <div className="flex items-center gap-3 py-4 text-gray-400">
                                      <BookOpen className="w-5 h-5" />
                                      <p className="text-sm font-bold">No content uploaded for this lesson yet.</p>
                                    </div>
                                  )}
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};