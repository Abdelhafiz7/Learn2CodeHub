import { useParams, Link } from "react-router-dom";
import { useApi } from "@/hooks";
import { coursesApi } from "@/api";
import {
  Star,
  Users,
  BookOpen,
  Award,
  Globe,
  MessageCircle
} from "lucide-react";
import { LoadingSpinner, Button } from "@/components/ui";
import { CourseCard } from "@/components/course";
import { useEffect } from "react";




const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const InstructorProfilePage = () => {
  const { id } = useParams();

  const { data: instructor, isLoading } = useApi(
    () => coursesApi.getInstructorProfile(id!),
    [id]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!instructor) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B0D12]">
      <div className="text-center">
        <h2 className="text-2xl font-black mb-4">Instructor not found</h2>
        <Link to="/courses">
          <Button variant="outline">Back to Courses</Button>
        </Link>
      </div>
    </div>
  );


  const socialLinks = [
    {
      key: 'github',
      url: instructor.githubUrl,
      icon: <GithubIcon />,
      label: 'GitHub',
      hoverColor: 'hover:text-white hover:bg-gray-900 dark:hover:bg-white dark:hover:text-black',
    },
    {
      key: 'twitter',
      url: instructor.twitterUrl,
      icon: <TwitterIcon />,
      label: 'Twitter / X',
      hoverColor: 'hover:text-white hover:bg-black',
    },
    {
      key: 'linkedin',
      url: instructor.linkedInUrl,
      icon: <LinkedInIcon />,
      label: 'LinkedIn',
      hoverColor: 'hover:text-white hover:bg-[#0A66C2]',
    },
    {
      key: 'youtube',
      url: instructor.youtubeUrl,
      icon: <YoutubeIcon />,
      label: 'YouTube',
      hoverColor: 'hover:text-white hover:bg-[#FF0000]',
    },
    {
      key: 'website',
      url: instructor.websiteUrl,
      icon: <Globe className="w-5 h-5" />,
      label: 'Website',
      hoverColor: 'hover:text-white hover:bg-indigo-600',
    },
  ].filter((link) => !!link.url);


  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0D12] text-gray-900 dark:text-white pb-20">

      <div className="relative h-72 overflow-hidden bg-[#080B11]">

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="absolute top-[-60px] left-[-60px] w-[340px] h-[340px] rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="absolute top-[-40px] right-[-40px] w-[280px] h-[280px] rounded-full bg-cyan-400/15 blur-[80px]" />
        <div className="absolute bottom-[-60px] left-[40%] w-[300px] h-[300px] rounded-full bg-violet-600/20 blur-[90px]" />
        <div className="absolute top-[20px] left-[30%] w-[180px] h-[180px] rounded-full bg-emerald-400/10 blur-[60px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8FAFC] dark:from-[#0B0D12] to-transparent" />

        <div className="max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-8 relative z-10">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4 group w-fit"
          >
          </Link>
        </div>
      </div>

      {/* 👤 PROFILE CARD */}
      <div className="max-w-6xl mx-auto px-6 -mt-50 relative z-20">
        <div className="bg-white dark:bg-[#13151A] rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-500/5 border border-gray-200 dark:border-white/5">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">

            {/* AVATAR + SOCIAL */}
            <div className="flex flex-col gap-6 items-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-[3rem] border-8 border-white dark:border-[#13151A] overflow-hidden bg-black flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-black/20">
                  {instructor.profileImageUrl ? (
                    <img
                      src={instructor.profileImageUrl}
                      className="w-full h-full object-cover"
                      alt={instructor.firstName}
                    />
                  ) : (
                    instructor.firstName.charAt(0)
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 border-4 border-white dark:border-[#13151A]">
                  <Award className="w-5 h-5" />
                </div>
              </div>



              {/* SOCIAL LINKS — only renders if instructor has URLs */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {socialLinks.map((link) => (
                    <a
                      key={link.key}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.label}
                      className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all duration-200 ${link.hoverColor}`}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              )}

              {/* If no social links at all, show placeholder message */}
              {socialLinks.length === 0 && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                  No social links
                </p>
              )}
            </div>

            {/* INFO CONTENT */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                    {instructor.firstName} {instructor.lastName}
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Master Instructor", instructor.major]
                      .filter(Boolean)
                      .map((label) => (
                        <span
                          key={label}
                          className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100 dark:border-indigo-500/20"
                        >
                          {label}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-2xl mb-8">
                <p className="text-gray-500 dark:text-gray-400 text-lg italic leading-relaxed">
                  "{instructor.bio || "Crafting world-class learning experiences to help students achieve their technical dreams."}"
                </p>
              </div>

              {/* STATS ROW */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="px-6 py-3 bg-[#F8FAFC] dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 fill-amber-600" />
                  </div>
                  <div>
                    <p className="text-xl font-black">{instructor.averageRating?.toFixed(1) || "0.0"}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Rating</p>
                  </div>
                </div>

                <div className="px-6 py-3 bg-[#F8FAFC] dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-black">{instructor.totalStudents?.toLocaleString() || 0}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Students</p>
                  </div>
                </div>

                <div className="px-6 py-3 bg-[#F8FAFC] dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 text-purple-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-black">{instructor.totalCourses || 0}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Courses</p>
                  </div>
                </div>

                <div className="px-6 py-3 bg-[#F8FAFC] dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-black">{instructor.totalReviewers?.toLocaleString() || 0}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📚 COURSES GRID */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-indigo-600 rounded-full" />
            <h2 className="text-3xl font-black tracking-tight">Courses by {instructor.firstName}</h2>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {instructor.courses?.length || 0} results
          </p>
        </div>

        {!instructor.courses?.length ? (
          <div className="text-center py-20 bg-white dark:bg-[#13151A] rounded-[3rem] border border-gray-100 dark:border-white/5">
            <p className="text-gray-500 font-bold">This instructor hasn't published any courses yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {instructor.courses.map((course: any) => (
              <div key={course.id}>
                <CourseCard
                 course={course} showInstructor={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};