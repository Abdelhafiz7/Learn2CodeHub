import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  ArrowRight,
  BarChart2,
  Users
} from 'lucide-react';
import type { Course } from '@/types';

interface CourseCardProps {
  course: Course;
  showInstructor?: boolean;
}

const getLevelStyles = (level?: string) => {
  switch (level) {
    case "Beginner":
      return {
        label: "Beginner",
        bar: "bg-emerald-500",
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
        dot: "bg-emerald-500",
      };
    case "Intermediate":
      return {
        label: "Intermediate",
        bar: "bg-amber-500",
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
        dot: "bg-amber-500",
      };
    case "Advanced":
      return {
        label: "Advanced",
        bar: "bg-rose-500",
        badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
        dot: "bg-rose-500",
      };
    default:
      return {
        label: "All Levels",
        bar: "bg-gray-400",
        badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        dot: "bg-gray-400",
      };
  }
};

const formatDuration = (minutes?: number) => {
  if (!minutes || minutes <= 0) return "--";

  const hours = minutes / 60;

  return `${Number(hours.toFixed(1))}h`;
};

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  showInstructor = true,
}) => {
  const navigate = useNavigate();
  const levelStyles = getLevelStyles(course.level);
  const accentColor =
    course.level === "Beginner" ? "from-blue-500/20 to-emerald-500/20" :
      course.level === "Intermediate" ? "from-indigo-500/20 to-purple-500/20" :
        "from-rose-500/20 to-amber-500/20";

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="group cursor-pointer relative flex flex-col bg-white dark:bg-[#1C1F26] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-700 overflow-hidden h-full"
    >
      {/* THUMBNAIL SECTION */}
      <div className="relative h-48 overflow-hidden m-4 rounded-[2rem]">
        <img
          src={course.thumbnailUrl || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80`}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* RATING BADGE */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
          <span className="text-yellow-500">★</span>
          <span className="text-[10px] font-black text-gray-900 dark:text-white">
            {course.rating > 0 ? course.rating.toFixed(1) : "New"}
          </span>
        </div>
      </div>

      {/* BACKGROUND BLOB */}
      <div className={`absolute top-1/2 -right-20 w-64 h-64 bg-gradient-to-br ${accentColor} rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000 opacity-40`} />

      <div className="relative z-10 flex flex-col flex-1 px-8 pb-8">
        <div className="flex flex-col gap-2 mb-4">
          {course.category?.name && (
            <span className="w-fit px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 dark:border-indigo-500/20">
              {course.category.name}
            </span>
          )}
          <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
          {course.shortDescription}
        </p>

        {/* LEVEL INDICATOR */}
        <div className="mb-6 flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${levelStyles.badge}`}>
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {levelStyles.label}
            </span>
          </div>
        </div>

        {showInstructor && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xs border border-white dark:border-gray-800 shadow-sm">
              {course.instructor?.firstName?.charAt(0) || "I"}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">
                Instructor
              </span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-none">
                {course.instructor
                  ? `${course.instructor.firstName} ${course.instructor.lastName}`
                  : "Expert Instructor"}
              </span>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                <Clock className="w-4 h-4 text-indigo-500" />
                {formatDuration(course.totalDuration)}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                {course.totalLessons} Lessons
              </div>
            </div>
            {course.enrollmentCount !== undefined && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Users className="w-3.5 h-3.5" />
                {course.enrollmentCount.toLocaleString()} Students
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {course.price === 0 ? "Free" : `$${course.price}`}
            </span>
            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
              Explore
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

