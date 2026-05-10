import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Play,
  Lock,
  Star,
  Globe,
  Award,
  BarChart2,
  Sparkles,
} from 'lucide-react';
import { Button, LoadingSpinner } from '@/components/ui';
import { coursesApi } from '@/api';
import { useApi } from '@/hooks';
import { useAuthStore } from '@/store';
import { formatPrice, formatDuration, formatDate, getErrorMessage } from '@/utils';
import toast from 'react-hot-toast';
import type { Review } from '@/api/courses';
import { wishlistApi } from '@/api/wishlistApi';
import type { Course } from '@/types';
import { enrollmentsApi } from "@/api/enrollments";


export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [enrolling, setEnrolling] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<Number | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);



  if (!id) return null;

  const { data: course, isLoading, error } = useApi(
    () => coursesApi.getCourseById(id),
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

  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const list = await enrollmentsApi.getMyEnrollments();
        const exists = list.some((c) => c.courseId === Number(id));
        setIsEnrolled(exists);
      } catch (err) {
        console.error("Enrollment check failed:", err);
      }
    }

    if (id && isAuthenticated) checkEnrollment();
  }, [id, isAuthenticated]);

  const formattedUpdatedAt = course?.updatedAt
    ? new Date(course.updatedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
    : "N/A";

  useEffect(() => {
    if (!id) return;

    coursesApi.getCourseReviews(id)
      .then(setReviews)
      .catch(() => { });
  }, [id]);

  useEffect(() => {
    if (!id) return;

    coursesApi.getRelatedCourses(id)
      .then(setRelatedCourses)
      .catch(() => { });
  }, [id]);


  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!id || isEnrolled) return;
    console.log("Enroll clicked", id);

    setEnrolling(true);

    try {
      await coursesApi.enrollInCourse(id);

      setIsEnrolled(true);
      toast.success('Successfully enrolled! 🎉');

    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEnrolling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!id || rating === 0 || comment.trim().length < 5) {
      toast.error('Comment must be at least 5 characters');
      return;
    }

    setSubmitting(true);

    try {
      const newReview = await coursesApi.createReview(id, { rating, comment });

      const newReviewFixed: Review = {
        ...newReview,
        user: {
          id: user?.id ?? "temp-user",
          firstName: user?.firstName || "You",
          lastName: user?.lastName || "",
          profileImageUrl: user?.profileImageUrl
        }
      };

      setReviews((prev) => [newReviewFixed, ...prev]);

      setRating(0);
      setComment("");

      toast.success("Review submitted successfully!");
    }
    catch (err) {
      toast.error(getErrorMessage(err));
    }
    finally {
      setSubmitting(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSaving(true);

      if (isSaved) {
        await wishlistApi.remove(Number(id));
        setIsSaved(false);
        toast.success("Removed from your list");
      } else {
        if (!id) return;
        await wishlistApi.add(Number(id));
        setIsSaved(true);
        toast.success("Added to your list ❤️");
      }

    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const handleUpdateReview = async (courseId: string) => {
    try {
      const updated = await coursesApi.createReview(courseId, {
        rating: editRating,
        comment: editComment
      });

      setReviews(prev =>
        prev.map(r => r.id === updated.id ? updated : r)
      );

      setEditingReviewId(null);
      toast.success("Review updated!");
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (courseId: string, reviewId: string) => {
    try {
      await coursesApi.deleteReview(courseId);

      setReviews(prev => prev.filter(r => r.id !== Number(reviewId)));

      toast.success("Review deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const list = await wishlistApi.getMyList();
        const exists = list.some(item => item.courseId === Number(id));
        setIsSaved(exists);
      } catch { }
    };

    if (id) checkWishlist();
  }, [id]);

  if (isLoading) return <LoadingSpinner fullPage text="Loading course..." />;

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <BookOpen className="h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-700">Course not found</h2>
        <Link to="/courses">
          <Button variant="outline">Browse Courses</Button>
        </Link>
      </div>
    );
  }

  const totalLessons = course.sections?.reduce(
    (acc, s) => acc + s.lessons.length, 0
  ) ?? course.totalLessons;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] transition-colors duration-300">
      {/* ─── IMMERSIVE HERO SECTION ────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#0F1115] pt-15 pb-32">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 items-center">

            {/* Hero Content */}
            <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
              <nav className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-500">
                <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-indigo-400">{course.category?.name}</span>
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
                  <span className="text-base font-black text-white">{course.rating?.toFixed(1) || "New"}</span>
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
                  <span className="text-base font-black text-white">
                    {formattedUpdatedAt}
                  </span>
                  <span className="text-xs font-bold text-gray-500">Last Updated</span>
                </div>
              </div>

              {course.instructor && (
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-xl shadow-indigo-600/20">
                    {course.instructor.profileImageUrl ? (
                      <img src={course.instructor.profileImageUrl} alt={course.instructor.firstName} className="w-full h-full object-cover rounded-xl" />
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

              {/* Premium Wide Bento Skill Path */}
              <div className="pt-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <div className="max-w-3xl bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
                  <div className="relative p-10 flex flex-col md:flex-row gap-12 items-center">

                    {/* Left: Skill List */}
                    <div className="flex-1 space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                          <Sparkles className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/90">Path Mastery</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                        {[
                          { icon: Sparkles, text: "AI-guided coding help", color: "text-indigo-400" },
                          { icon: BookOpen, text: "Real-world projects", color: "text-emerald-400" },
                          { icon: CheckCircle, text: "Official Certificate", color: "text-rose-400" },
                          { icon: Globe, text: "Global Community", color: "text-amber-400" }
                        ].map((item, i) => (
                          <div key={i} className="group/item flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center group-hover/item:bg-indigo-600 transition-all duration-300">
                              <item.icon className={`w-4 h-4 ${item.color} group-hover/item:text-white transition-colors`} />
                            </div>
                            <p className="text-sm font-bold text-gray-400 group-hover/item:text-white transition-colors leading-snug">
                              {item.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Feature Spotlight */}
                    <div className="hidden lg:flex w-48 h-48 bg-indigo-600/10 rounded-[2.5rem] border border-indigo-500/20 items-center justify-center relative overflow-hidden group-hover:border-indigo-500/40 transition-colors">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-50" />
                      <div className="relative text-center space-y-2 transform group-hover:scale-110 transition-transform duration-700">
                        <Award className="w-12 h-12 text-indigo-400 mx-auto drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Verified Path</p>
                      </div>

                      {/* Animated Glow */}
                      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rotate-45 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Preview Card - Resized to be more compact */}
            <div className="lg:col-span-4 animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="relative group overflow-hidden rounded-[2.5rem] bg-[#1C1F26] border border-white/10 shadow-2xl shadow-black/50 p-3">
                <div className="relative aspect-video overflow-hidden rounded-[1.8rem]">
                  <img
                    src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-500">
                      <Play className="w-6 h-6 text-indigo-600 fill-indigo-600 translate-x-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-white">{formatPrice(course.price)}</span>
                    <div className="px-3 py-1 bg-indigo-600/10 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      Best Seller
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        if (isEnrolled) {
                          navigate(`/student/courses/${id}/learn`);
                        } else {
                          handleEnroll();
                        }
                      }}
                      disabled={enrolling}
                      className={`w-full py-4 rounded-xl font-bold transition-all
                        ${isEnrolled
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25"
                        }
                      `}
                    >
                      {enrolling ? "Enrolling..." : isEnrolled ? "Continue Learning" : "Enroll Now"}
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      className="rounded-xl h-14 border-white/10 text-white hover:bg-white/5 font-black text-sm"
                      onClick={handleWishlist}
                      isLoading={saving}
                    >
                      {isSaved ? "✓ Saved to List" : "❤️ Save to My List"}
                    </Button>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Course Includes</p>
                    <div className="grid grid-cols-1 gap-3 text-xs text-gray-400 font-bold">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        Full Lifetime Access
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-indigo-500" />
                        Subtitles in English
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-indigo-500" />
                        Certificate of Completion
                      </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Left Column */}
          <div className="lg:col-span-8 space-y-16">

            {/* Staggered Bento Learning Section */}
            {course.whatYouLearn && course.whatYouLearn.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-end justify-between">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">What You'll Master</h2>
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500/20" />
                    <span className="w-3 h-3 rounded-full bg-indigo-500/40" />
                    <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                  {course.whatYouLearn.map((item, i) => {
                    const spanClass =
                      i === 0 ? "md:col-span-4" :
                        i === 1 ? "md:col-span-2" :
                          i === 2 ? "md:col-span-3" :
                            i === 3 ? "md:col-span-3" :
                              "md:col-span-2";

                    const colors = [
                      "border-indigo-500/30 text-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10",
                      "border-emerald-500/30 text-emerald-600 bg-emerald-50/30 dark:bg-emerald-900/10",
                      "border-rose-500/30 text-rose-600 bg-rose-50/30 dark:bg-rose-900/10",
                      "border-amber-500/30 text-amber-600 bg-amber-50/30 dark:bg-amber-900/10",
                    ];
                    const color = colors[i % colors.length];

                    return (
                      <div
                        key={i}
                        className={`${spanClass} relative group overflow-hidden bg-white dark:bg-[#1C1F26] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1`}
                      >
                        {/* Background Number */}
                        <div className="absolute -right-4 -bottom-6 text-9xl font-black text-gray-50 dark:text-white/5 select-none transition-all group-hover:scale-110 group-hover:text-indigo-500/10">
                          {String(i + 1).padStart(2, '0')}
                        </div>

                        <div className="relative z-10 space-y-4">
                          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug pr-10">
                            {item}
                          </p>
                        </div>

                        {/* Top Decoration */}
                        <div className={`absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-2 ${color.split(' ')[0].replace('border-', 'bg-').replace('/30', '')}`} />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Curriculum Roadmap Moved Below */}



          </div>

          {/* Right Column / Sticky Info */}
          <div className="lg:col-span-4 space-y-10">

            {/* Sticky Sidebar Group */}
            <div className="sticky top-8 space-y-8">

              {/* Requirements Box */}
              {course.requirements && course.requirements.length > 0 && (
                <section className="bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] p-8 border border-indigo-100 dark:border-indigo-800/30">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Prerequisites</h3>
                  <ul className="space-y-4">
                    {course.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

            </div>

          </div>
        </div>

        <div className="grid grid-cols-4 gap-8 items-stretch mt-16 min-h-[400px]">
          {/* Left: Detailed Description */}
          <section className="col-span-3 bg-gray-50 dark:bg-[#1C1F26] rounded-[3rem] p-8 lg:p-14 border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">About This Course</h2>
            </div>
            <div className="prose prose-indigo dark:prose-invert max-w-none flex-1">
              <p className="whitespace-pre-line text-lg leading-relaxed text-gray-600 dark:text-gray-400 font-bold">
                {course.description}
              </p>
            </div>
          </section>

          {/* Right: Instructor Card */}
          <Link to={`/instructors/${course.instructor.id}`} className="block group">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 shadow-xl transition-all group-hover:shadow-2xl group-hover:-translate-y-1 cursor-pointer">

              <div className="p-8 flex flex-col h-full relative">

                {/* Glow */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full"></div>

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6 z-10">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">
                    Instructor
                  </h3>

                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-[10px] font-black uppercase">
                    Top Mentor
                  </span>
                </div>

                {/* CONTENT */}
                <div className="flex flex-col items-center text-center z-10">

                  {/* AVATAR */}
                  <div className="relative mb-6 group-hover:scale-105 transition">
                    <div className="w-28 h-28 rounded-full border-4 border-indigo-500/20 p-[2px]">
                      <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center text-white text-3xl font-black">
                        {course.instructor.profileImageUrl ? (
                          <img
                            src={course.instructor.profileImageUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          course.instructor.firstName.charAt(0)
                        )}
                      </div>
                    </div>

                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black p-2 rounded-full shadow-md">
                      <Award className="w-4 h-4 text-indigo-500" />
                    </div>
                  </div>

                  {/* NAME */}
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </h4>

                  <p className="text-xs text-gray-400 mt-1">
                    Building the future with code ✨
                  </p>

                  {/* STATS */}
                  <div className="flex flex-wrap justify-center gap-3 mt-6">
                    <div className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-sm font-bold">
                      ⭐ {course.instructor.rating?.toFixed(1) || "0.0"}
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#0F1115] text-gray-700 dark:text-gray-300 text-sm font-bold">
                      👥 {course.instructor.totalStudents || 0}
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#0F1115] text-gray-700 dark:text-gray-300 text-sm font-bold">
                      💬 {course.instructor.totalReviewers || 0}
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#0F1115] text-gray-700 dark:text-gray-300 text-sm font-bold">
                      📚 {course.instructor.totalCourses || 0}
                    </div>
                  </div>

                  {/* BIO */}
                  {course.instructor.bio && (
                    <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
                      {course.instructor.bio.length > 120
                        ? course.instructor.bio.slice(0, 120) + "..."
                        : course.instructor.bio}
                    </p>
                  )}

                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ─── REVIEWS SECTION ────────────────────────────────────────────── */}
        {/* ─── CURRICULUM SECTION ────────────────────────────────────────────── */}
        {course.sections && course.sections.length > 0 && (
          <section className="mt-20 py-20 border-t border-gray-100 dark:border-gray-800">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Course Curriculum</h2>
                  <p className="mt-2 text-lg text-gray-500 font-medium">Everything you'll learn in this course</p>
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-6 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                  {course.sections.length} Sections · {totalLessons} Lessons
                </span>
              </div>

              <div className="space-y-4 pt-4">
                {course.sections.map((section, idx) => (
                  <div
                    key={section.id}
                    className={`overflow-hidden rounded-[2rem] border transition-all ${expandedSections.has(section.id)
                      ? 'border-indigo-500 shadow-xl shadow-indigo-500/10'
                      : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1C1F26]'
                      }`}
                  >
                    <button
                      className={`flex w-full items-center justify-between px-8 py-6 text-left transition-colors ${expandedSections.has(section.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-[#1C1F26]/80'
                        }`}
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-sm ${expandedSections.has(section.id) ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                          }`}>
                          {idx + 1}
                        </div>
                        <span className="text-lg font-black text-gray-900 dark:text-white">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400 hidden sm:inline-block">
                          {section.lessons.length} Lessons
                        </span>
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-5 w-5 text-indigo-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {expandedSections.has(section.id) && (
                      <div className="bg-white dark:bg-[#0F1115] divide-y divide-gray-100 dark:divide-gray-800 animate-in slide-in-from-top-4 duration-300">
                        {section.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={`flex items-center justify-between px-8 py-5 group transition-colors ${lesson.isPreview ? 'cursor-pointer hover:bg-indigo-900/5' : 'hover:bg-gray-50'}`}
                            onClick={() => {
                              if (lesson.isPreview) {
                                navigate(`/student/courses/${id}/learn?lesson=${lesson.id}`);
                              }
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${lesson.isPreview ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                }`}>
                                {lesson.isPreview ? <Play className="h-4 w-4 fill-emerald-600" /> : <Lock className="h-4 w-4" />}
                              </div>
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">
                                {lesson.title}
                              </span>
                              {lesson.isPreview && (
                                <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                  Free Preview
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-gray-400">
                              {formatDuration(lesson.duration || lesson.durationInMinutes || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-20 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Student Experience</h2>
              <p className="mt-2 text-lg text-gray-500 font-medium">Real feedback from developers around the world</p>
            </div>

            {/* {user?.role === 'Student' && (
              <button
                onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 transition-transform"
              >
                Write a Review
              </button>
            )} */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-12">

              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white to-gray-50 dark:from-[#15171E] dark:to-[#0F1115] border border-gray-200 dark:border-white/5 shadow-2xl shadow-indigo-900/5 dark:shadow-black/40">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                <div className="relative flex flex-col lg:flex-row items-stretch p-8 lg:p-10 gap-10">

                  <div className="flex-shrink-0 lg:w-[220px] flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 pb-8 lg:pb-0 lg:pr-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Course Rating</h3>
                    <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-gray-600 tracking-tighter mb-4 leading-none">
                      {(course.rating || 0).toFixed(1)}
                    </p>
                    <div className="flex gap-1.5 mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-5 h-5 ${s <= (course.rating || 0) ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'text-gray-200 dark:text-white/10'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 w-full flex flex-col justify-center">
                    {true || user?.role === 'Student' ? (
                      <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-black text-gray-900 dark:text-gray-300">Share Your Experience</h3>
                          <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                onClick={() => setRating(star)}
                                className={`h-5 w-5 cursor-pointer transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="relative group">
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you love? What could be improved?"
                            className="w-full h-[120px] bg-white dark:bg-[#0A0C10] rounded-2xl border border-gray-200 dark:border-white/5 focus:border-indigo-500/50 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none resize-none transition-all p-5 pb-16 shadow-inner dark:shadow-none"
                          />
                          <div className="absolute bottom-3 right-3 flex items-center gap-3">
                            {comment.length > 0 && <span className="text-[10px] font-bold text-gray-400">{comment.length} chars</span>}
                            <Button
                              isLoading={submitting}
                              onClick={handleSubmitReview}
                              disabled={rating === 0 || !comment.trim()}
                              className="rounded-xl px-6 h-10 font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all"
                            >
                              Publish
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-6">
                        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-3 border border-gray-100 dark:border-white/5">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-black text-gray-900 dark:text-white mb-1">Locked</p>
                        <p className="text-xs font-medium text-gray-500 max-w-[200px]">Enroll in the course to unlock the review form.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-[#1C1F26]/30 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-400 flex items-center justify-center mb-4">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Reviews Yet</h4>
                    <p className="text-sm font-medium text-gray-500">
                      Be the first to share your thoughts!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((review) => {
                      const isOwner = Number(review.user?.id) === Number(user?.id);
                      return (
                        <div
                          key={review.id}
                          className="bg-white dark:bg-[#1C1F26] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-xl hover:shadow-black/5"
                        >
                          {/* HEADER */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black">
                                {review.user?.firstName?.charAt(0) ?? "?"}
                              </div>

                              <div>
                                <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1">
                                  {review.user
                                    ? `${review.user.firstName} ${review.user.lastName}`
                                    : "Anonymous"}
                                </p>
                              </div>
                            </div>

                            {/* ✏️ EDIT & DELETE */}
                            {isOwner && (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleEdit(review)}
                                  className="text-xs font-bold text-indigo-500 hover:text-indigo-400 transition"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => handleDelete(String(course.id), String(review.id))}
                                  className="text-xs font-bold text-red-500 hover:text-red-400 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>

                          {/* ⭐ RATING */}
                          <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${s <= review.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-200"
                                  }`}
                              />
                            ))}
                          </div>

                          {/* ✏️ EDIT MODE */}
                          {editingReviewId === review.id ? (
                            <div className="space-y-4">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    onClick={() => setEditRating(star)}
                                    className={`w-5 h-5 cursor-pointer ${star <= editRating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                      }`}
                                  />
                                ))}
                              </div>

                              {/* Textarea */}
                              <textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-[#0F1115] border border-gray-200 dark:border-gray-700 text-sm"
                              />

                              {/* Actions */}
                              <div className="flex gap-4">
                                <button
                                  onClick={() => handleUpdateReview(course.id)}
                                  className="text-xs font-bold text-green-500"
                                >
                                  Save
                                </button>

                                <button
                                  onClick={() => setEditingReviewId(null)}
                                  className="text-xs font-bold text-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* COMMENT */}
                              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                "{review.comment}"
                              </p>

                              {/* DATE */}
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {formatDate(review.createdAt)}
                              </p>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Related Courses */}
            <div className="lg:col-span-4 space-y-10">
              <div className="sticky top-8 space-y-8">
                <div className="bg-white dark:bg-[#1C1F26] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Related Courses</h3>
                    <span className="px-3 py-1 bg-indigo-600/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">Explore</span>
                  </div>

                  <div className="space-y-4">
                    {relatedCourses.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">
                        No related courses found
                      </p>
                    ) : (
                      relatedCourses.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => navigate(`/courses/${c.id}`)}
                          className="group cursor-pointer"
                        >
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#0F1115] border border-transparent hover:border-indigo-500/30 transition-all duration-300">

                            {/* IMAGE */}
                            <div className="w-16 h-12 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                              <img
                                src={c.thumbnailUrl || "https://via.placeholder.com/300"}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>

                            {/* CONTENT */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                                {c.level}
                              </p>

                              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2">
                                {c.title}
                              </p>

                              {/* ⭐ rating */}
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-gray-500">
                                  {c.rating?.toFixed(1) || "New"}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  ({c.reviewCount})
                                </span>
                              </div>
                            </div>

                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-8 border-t border-gray-100 dark:border-gray-800 mt-8">
                    <button
                      onClick={() => navigate("/courses")}
                      className="w-full py-4 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600/5 rounded-2xl transition-all text-center"
                    >
                      View All Related Courses
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
