import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Play,
  Lock,
  Menu,
  X,
  Award,
  Share2,
  Star,
  MonitorPlay,
  Layers,
  ArrowLeft,
  BookOpen,
  MessageSquare,
  FileText
} from 'lucide-react';
import { Button, ProgressBar, LoadingSpinner } from '@/components/ui';
import { coursesApi } from '@/api';
import { useApi } from '@/hooks';
import { formatDuration, getErrorMessage } from '@/utils';
import type { CourseDetail, Lesson } from '@/types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { enrollmentsApi } from '@/api/enrollments';
import { useAuthStore } from '@/store';

export const CourseLearningPage: React.FC = () => {
  const { id: paramId, courseId } = useParams<{ id?: string, courseId?: string }>();
  const id = paramId || courseId;
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'qa'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const lastProgressRef = React.useRef(0);
  const lastTimeRef = React.useRef(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(true); // Default to true to avoid UI flicker
  const { isAuthenticated } = useAuthStore();

  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const lessonIdFromUrl = params.get('lesson');
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const { data: course, isLoading } = useApi<CourseDetail>(
    () => coursesApi.getCourseById(id!),
    [id]
  );

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!isAuthenticated) {
        setIsEnrolled(false);
        return;
      }
      try {
        const list = await enrollmentsApi.getMyEnrollments();
        const exists = list.some((c) => c.courseId === Number(id));
        setIsEnrolled(exists);
      } catch (err) {
        console.error("Enrollment check failed:", err);
        setIsEnrolled(false);
      }
    };
    if (id) checkEnrollment();
  }, [id, isAuthenticated]);

  if (!id) return null;

  useEffect(() => {
    if (currentLesson && course?.sections) {
      const section = course.sections.find(s => s.lessons.some(l => l.id === currentLesson.id));
      if (section) {
        setExpandedSections(prev => new Set([...prev, section.id]));
      }
    }
  }, [currentLesson, course?.sections]);

  useEffect(() => {
    if (!course || !lessonIdFromUrl) return;
    const allLessons = course.sections?.flatMap(s =>
      s.lessons.map(l => ({ ...l, duration: l.duration || 0 }))
    ) ?? [];
    const found = allLessons.find(l => l.id === Number(lessonIdFromUrl));
    if (found) setCurrentLesson(found);
  }, [course, lessonIdFromUrl]);

  useEffect(() => {
    if (!currentLesson) return;
    const loadProgress = async () => {
      try {
        const res = await coursesApi.getLessonProgress(currentLesson.id);
        if (videoRef.current && res.watchedPercentage > 0) {
          const video = videoRef.current;
          const handler = () => {
            video.currentTime = (res.watchedPercentage / 100) * video.duration;
          };
          video.addEventListener("loadedmetadata", handler);
          return () => video.removeEventListener("loadedmetadata", handler);
        }
      } catch { }
    };
    loadProgress();
  }, [currentLesson?.id]);

  useEffect(() => {
    if (!currentLesson) return;

    const loadNote = async () => {
      try {
        const res = await coursesApi.getLessonNote(currentLesson.id);
        setNote(res.content || '');
      } catch {
        console.log("Failed to load note");
      }
    };

    loadNote();
  }, [currentLesson?.id]);

  useEffect(() => {
    const loadCompletedLessons = async () => {
      if (!id) return;
      try {
        const completedIds = await coursesApi.getCompletedLessons(id);
        setCompletedLessons(new Set(completedIds));
      } catch {
        console.log("Failed to load completed lessons");
      }
    };
    loadCompletedLessons();
  }, [id]);

  useEffect(() => {
    const initLesson = async () => {
      if (!course) return;
      const allLessons = course.sections?.flatMap(s => s.lessons) ?? [];
      try {
        const lastLessonId = await coursesApi.getLastLesson(id);
        if (lastLessonId) {
          const found = allLessons.find(l => l.id === lastLessonId);
          if (found) { setCurrentLesson(found); return; }
        }
      } catch {
        console.log("No last lesson");
      }
      if (allLessons[0]) setCurrentLesson(allLessons[0]);
    };
    initLesson();
  }, [course]);

  useEffect(() => {
    setShowNextOverlay(false);
    setCountdown(5);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, [currentLesson?.id]);

  const allLessons = React.useMemo(
    () => course?.sections?.flatMap(s => s.lessons).filter(l => isEnrolled || l.isPreview) ?? [],
    [course, isEnrolled]
  );
  const rawIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const currentIndex = rawIndex === -1 ? 0 : rawIndex;
  const progress = allLessons.length > 0 ? Math.round((completedLessons.size / allLessons.length) * 100) : 0;
  const isCourseCompleted = allLessons.length > 0 && completedLessons.size >= allLessons.length;

  const navigate = useNavigate();

  const goToLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    navigate(`?lesson=${lesson.id}`);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) goToLesson(allLessons[currentIndex - 1]);
  };

  const goToNext = () => {
    if (currentIndex < allLessons.length - 1) goToLesson(allLessons[currentIndex + 1]);
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    setMarkingComplete(true);
    try {
      await coursesApi.markLessonComplete(currentLesson.id);
      setCompletedLessons(prev => {
        const updated = new Set(prev);
        updated.add(currentLesson.id);
        toast.success("Lesson completed ✅");
        return updated;
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMarkingComplete(false);
    }
  };

  const startCountdown = () => {
    if (!isEnrolled) {
      setShowNextOverlay(true);
      return;
    }

    if (currentIndex >= allLessons.length - 1) {
      if (!completedLessons.has(currentLesson!.id)) handleMarkComplete();
      return;
    }

    setShowNextOverlay(true);
    setCountdown(5);

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setShowNextOverlay(false);
          if (!completedLessons.has(currentLesson!.id)) handleMarkComplete();
          goToNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleReplay = () => {
    clearInterval(countdownRef.current!);
    setShowNextOverlay(false);
    setCountdown(5);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleGoNextNow = () => {
    clearInterval(countdownRef.current!);
    setShowNextOverlay(false);
    if (!completedLessons.has(currentLesson!.id)) handleMarkComplete();
    goToNext();
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: course?.title, text: "Check out this course!", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard 🔗");
      }
    } catch {
      toast.error("Failed to share");
    }
  };

  const saveNote = async () => {
    if (!currentLesson) return;

    setSavingNote(true);

    try {
      await coursesApi.saveLessonNote(currentLesson.id, note);
      toast.success("Notes saved 📝");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNote(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage text="Initializing workspace..." />;
  if (!course) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0A0C10]">
      <div className="text-center">
        <MonitorPlay className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-700" />
        <p className="text-gray-500 font-bold mb-4">Course not found</p>
        <Link to="/student/my-courses"><Button>Return to Dashboard</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#13151A] text-gray-900 dark:text-white font-sans transition-colors duration-300">

      {/* ── LEFT SIDEBAR ── */}
      <div className={`flex-shrink-0 flex flex-col bg-[#F8FAFC] dark:bg-[#0B0D12] border-r border-gray-200 dark:border-white/5 transition-all duration-300 relative z-20 ${sidebarOpen ? 'w-full md:w-[320px] lg:w-[380px]' : 'w-0 overflow-hidden border-none opacity-0'}`}>

        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white/5 shrink-0">
          <Link to="/student/my-courses" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-4">{course.title}</h2>
          <div className="bg-white dark:bg-[#13151A] p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              <span>Overall Progress</span>
              <span className="text-indigo-600 dark:text-indigo-400">{progress}%</span>
            </div>
            <ProgressBar value={progress} size="sm" color="indigo" />
            <p className="text-xs font-medium text-gray-400 mt-2">
              {completedLessons.size} of {allLessons.length} lessons completed
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {course.sections?.filter(s => isEnrolled || s.lessons.some(l => l.isPreview)).map((section, sIdx) => {
            const isExpanded = expandedSections.has(section.id);
            const sectionCompleted = section.lessons.filter(l => completedLessons.has(l.id)).length;
            const sectionTotal = section.lessons.length;
            const sectionDuration = section.lessons.reduce((acc, l) => acc + (l.durationInMinutes || l.duration || 0), 0);

            return (
              <div key={section.id} className="relative">
                <button onClick={() => toggleSection(section.id)} className="flex w-full items-center justify-between gap-3 mb-3 px-2 group text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black shrink-0">
                      {sIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{section.title}</h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                        {sectionCompleted}/{sectionTotal} Lessons • {formatDuration(sectionDuration)}
                      </p>
                    </div>
                  </div>
                  <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="space-y-1 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-gray-200 dark:before:bg-white/10 ml-1 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {section.lessons.filter(l => isEnrolled || l.isPreview).map((lesson) => {
                      const isActive = lesson.id === currentLesson?.id;
                      const isDone = completedLessons.has(lesson.id);
                      const isLocked = !isEnrolled && !lesson.isPreview;

                      return (
                        <button
                          key={lesson.id}
                          disabled={isLocked}
                          onClick={() => !isLocked && goToLesson(lesson)}
                          className={`relative flex w-full items-start gap-4 px-4 py-3 rounded-2xl transition-all group ${isActive ? 'bg-white dark:bg-[#1C1F26] shadow-md shadow-black/10 border border-gray-200 dark:border-indigo-500/10' : 'hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'} ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 z-10 bg-[#F8FAFC] dark:bg-[#0B0D12] ${isActive ? 'border-indigo-500 text-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : isDone ? 'border-[#00B87A] text-[#00B87A]' : 'border-gray-300 dark:border-gray-600 text-gray-300 dark:text-gray-600 group-hover:border-gray-500'}`}>
                            {isDone || isActive ? <CheckCircle className="w-3 h-3" /> : isLocked ? <Lock className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400" />}
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <p className={`text-sm font-bold leading-tight mb-1 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : isDone ? 'text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                              {lesson.title}
                            </p>
                            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-indigo-500/70 dark:text-indigo-400/70' : 'text-gray-400'}`}>
                              <Play className="w-3 h-3" />
                              {formatDuration(lesson.duration || lesson.durationInMinutes || 0)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-[#13151A]">

        {/* Top Nav */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#13151A]/80 backdrop-blur-xl z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Layers className="w-4 h-4" />
              <span>Workspace Focus Mode</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowRating(true)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Rate Course</span>
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Scrollable Center */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 lg:py-10">

            {/* ── VIDEO PLAYER ── */}
            <div className="relative w-full aspect-video rounded-[24px] lg:rounded-[32px] overflow-hidden bg-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] border border-gray-200 dark:border-white/10 group mb-8">

              {currentLesson?.videoUrl ? (
                currentLesson.videoUrl.includes("youtube") ? (
                  <iframe
                    src={currentLesson.videoUrl.includes("watch?v=") ? currentLesson.videoUrl.replace("watch?v=", "embed/") : currentLesson.videoUrl}
                    className="h-full w-full"
                    allowFullScreen
                    title={currentLesson.title}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    controls
                    src={currentLesson.videoUrl}
                    className="h-full w-full object-contain"
                    onEnded={startCountdown}
                    onTimeUpdate={(e) => {
                      const video = e.currentTarget;
                      const percentage = (video.currentTime / video.duration) * 100;
                      const now = Date.now();
                      if (percentage - lastProgressRef.current > 10 && now - lastTimeRef.current > 3000) {
                        lastProgressRef.current = percentage;
                        lastTimeRef.current = now;
                        coursesApi.updateLessonProgress(currentLesson.id, Math.round(percentage));
                      }
                    }}
                  />
                )
              ) : currentLesson?.fileUrl ? (
                <iframe src={currentLesson.fileUrl} className="h-full w-full bg-white" title="PDF Viewer" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#0B0D12]">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                      <MonitorPlay className="h-10 w-10 text-indigo-500 opacity-80" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                      {currentLesson ? "No media available" : "Select a lesson"}
                    </p>
                  </div>
                </div>
              )}

              {/* ── COUNTDOWN OVERLAY ── */}
              {showNextOverlay && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center rounded-[24px] lg:rounded-[32px] z-20">
                  <div className="text-center px-10">
                    {!isEnrolled ? (
                      <div className="animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/40 transform -rotate-3 hover:rotate-0 transition-transform">
                          <Lock className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-3">Master the full course?</h2>
                        <p className="text-gray-400 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                          You've finished this preview. Enroll now to unlock all {course?.totalLessons || 'premium'} lessons and get your certificate!
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                          <Button 
                            className="px-10 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-black shadow-xl shadow-indigo-600/30"
                            onClick={() => navigate(`/courses/${id}`)}
                          >
                            Enroll Now
                          </Button>
                          <button 
                            onClick={handleReplay}
                            className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                          >
                            Watch Again
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="animate-in fade-in duration-500">
                        {/* Animated Countdown Ring */}
                        <div className="relative w-24 h-24 mx-auto mb-6">
                          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                            <circle cx="48" cy="48" r="40" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="6" />
                            <circle
                              cx="48" cy="48" r="40"
                              fill="none"
                              stroke="#6366f1"
                              strokeWidth="6"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - countdown / 5)}`}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-black text-white">{countdown}</span>
                          </div>
                        </div>

                        <p className="text-white font-bold text-lg mb-1">Up Next</p>
                        <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto truncate">
                          {allLessons[currentIndex + 1]?.title || "End of course"}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={handleReplay}
                        className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-all"
                      >
                        ↺ Replay
                      </button>
                      <button
                        onClick={handleGoNextNow}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/30"
                      >
                        Next Lesson →
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* ── INFO + ACTIONS ── */}
            <div className="flex flex-col xl:flex-row gap-8 items-start">

              {/* Left: Title & Tabs */}
              <div className="flex-1 w-full min-w-0">
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                  {currentLesson?.title || "Lesson Title"}
                </h1>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8">
                  Lesson {currentIndex + 1} of {allLessons.length} • {formatDuration(currentLesson?.durationInMinutes || currentLesson?.duration || 0)}
                </p>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200 dark:border-white/5">
                  {[{ id: 'overview', label: 'Overview' }, { id: 'qa', label: 'Q&A' }, { id: 'notes', label: 'Notes' }].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-t-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="py-8 prose prose-gray dark:prose-invert max-w-none">
                  {activeTab === 'overview' && (
                    currentLesson?.content ? (
                      <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                        {currentLesson.content}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-gray-500">
                        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <p className="text-sm font-bold">No content available for this lesson.</p>
                      </div>
                    )
                  )}

                  {activeTab === 'qa' && (
                    <div className="text-center py-16 text-gray-500">
                      <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                      <p className="text-sm font-bold">Q&A for this lesson is currently unavailable.</p>
                    </div>
                  )}

                  {activeTab === 'notes' && currentLesson && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="bg-white dark:bg-[#1A1D24] rounded-2xl border border-gray-200 dark:border-white/5 p-1 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50">
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Write your personal notes here... They will be saved to your profile."
                          className="w-full h-48 rounded-xl bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-gray-100 p-4 resize-none placeholder:text-gray-400 font-medium"
                        />
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-b-xl border-t border-gray-100 dark:border-white/5">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                             <FileText className="w-4 h-4" />
                             Personal Notes
                          </span>
                          <Button 
                            onClick={saveNote} 
                            isLoading={savingNote}
                            className="h-9 px-6 rounded-lg text-xs font-bold shadow-md shadow-indigo-500/20"
                          >
                            Save Note
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Actions Panel */}
              <div className="w-full xl:w-80 flex-shrink-0 bg-[#F8FAFC] dark:bg-[#1A1D24] p-6 rounded-3xl border border-gray-200 dark:border-white/5 sticky top-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6">Lesson Actions</h3>

                <div className="space-y-4 mb-8">
                  {!isEnrolled ? (
                    <Button
                      className="w-full py-6 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
                      onClick={() => navigate(`/courses/${id}`)}
                    >
                      Enroll to Save Progress
                    </Button>
                  ) : completedLessons.has(currentLesson?.id || 0) ? (
                    <div className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-500/20">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-bold">Marked Complete</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full py-6 rounded-2xl font-bold shadow-lg shadow-indigo-500/25"
                      isLoading={markingComplete}
                      onClick={handleMarkComplete}
                      leftIcon={<CheckCircle className="h-5 w-5" />}
                    >
                      Mark as Complete
                    </Button>
                  )}
                </div>

                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white mb-4">Navigation</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="rounded-xl h-12 border-gray-200 dark:border-white/10 font-bold"
                    disabled={currentIndex === 0}
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>

                  {isCourseCompleted ? (
                    <Button
                      className="rounded-xl h-12 bg-emerald-500 hover:bg-emerald-600 border-none font-bold shadow-lg shadow-emerald-500/20"
                      onClick={() => toast.success("Course Completed!")}
                    >
                      <Award className="h-4 w-4 mr-1" /> Finish
                    </Button>
                  ) : currentIndex < allLessons.length - 1 ? (
                    <Button
                      className="rounded-xl h-12 font-bold shadow-lg shadow-indigo-500/20"
                      onClick={goToNext}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      className="rounded-xl h-12 bg-purple-500 hover:bg-purple-600 text-white font-bold border-none shadow-lg shadow-purple-500/20"
                      onClick={async () => {
                        try {
                          await coursesApi.completeCourse(String(id));
                          toast.success("Course completed 🎉");
                        } catch (e) {
                          toast.error(getErrorMessage(e));
                        }
                      }}
                    >
                      <Award className="h-4 w-4 mr-1" /> Finish
                    </Button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── RATING MODAL ── */}
      {showRating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1A1D24] p-6 rounded-2xl w-[350px]">
            <h2 className="text-lg font-bold mb-4">Rate this course</h2>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-6 h-6 cursor-pointer ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
                />
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a review..."
              className="w-full p-2 rounded-lg bg-gray-100 dark:bg-[#13151A] text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRating(false)}>Cancel</button>
              <button
                onClick={async () => {
                  try {
                    await coursesApi.createReview(id!, { rating, comment });
                    toast.success("Review submitted ⭐");
                    setShowRating(false);
                    setRating(0);
                    setComment("");
                  } catch {
                    toast.error("Failed to submit review");
                  }
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};