import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, DollarSign, TrendingUp, ArrowRight, PlusCircle, Star,
  UserX, BookX, ShieldAlert, Tags, ClipboardCheck, Shield, Home
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { LoadingSpinner, Badge } from '@/components/ui';
import { useApi } from '@/hooks';
import { formatPrice, formatDate } from '@/utils';
import { adminApi } from '@/api/adminApi';


export const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useApi(() => adminApi.getStats(), []);
  const { data: recentUsers, isLoading: usersLoading } = useApi(() => adminApi.getUsers({ page: 1, pageSize: 5 }), []);
  const { data: recentCourses, isLoading: coursesLoading } = useApi(() => adminApi.getCourses({ page: 1, pageSize: 5 }), []);
  const { data: analytics } = useApi(() => adminApi.getAnalytics(), []);
  const { data: topCourses } = useApi(() => adminApi.getTopCourses(), []);
  const { data: lowCourses } = useApi(() => adminApi.getLowCourses(), []);
  const { data: topInstructors } = useApi(() => adminApi.getTopInstructors(), []);
  const { data: activity } = useApi(() => adminApi.getActivityFeed(), []);
  const { data: pendingCourses } = useApi(() => adminApi.getPendingCourses(), []);
  const pendingCount = pendingCourses?.length ?? 0;
  const thisMonthEnrollments = (() => {
    if (!analytics?.enrollment?.length) return 0;
    return analytics.enrollment[analytics.enrollment.length - 1]?.value ?? 0;
  })();

  const publishedCourses = stats?.publishedCourses ?? 0;
  const totalCourses = stats?.totalCourses ?? 0;
  const draftCourses = totalCourses - publishedCourses;
  const publishedRatio = totalCourses > 0
    ? Math.round((publishedCourses / totalCourses) * 100)
    : 0;

  // ── Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label, isCurrency }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-[#1C1F26]/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] min-w-[140px] animate-in zoom-in-95 duration-200">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].stroke || payload[0].fill }} />
            <p className="text-xl font-black text-gray-900 dark:text-white">
              {isCurrency ? formatPrice(payload[0].value) : payload[0].value.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };


  const quickActions = [
    {
      label: 'Pending Approvals',
      description: `${pendingCount} course${pendingCount !== 1 ? 's' : ''} awaiting review`,
      icon: <ClipboardCheck className="h-5 w-5" />,
      to: '/admin/pending-courses',
      color: pendingCount > 0
        ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
        : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    {
      label: 'Manage Users',
      description: 'View, deactivate or change roles',
      icon: <Users className="h-5 w-5" />,
      to: '/admin/users',
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    {
      label: 'Manage Courses',
      description: 'Review, publish or remove courses',
      icon: <BookOpen className="h-5 w-5" />,
      to: '/admin/courses',
      color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    },
    {
      label: 'Inactive Users',
      description: 'View users with no recent activity',
      icon: <UserX className="h-5 w-5" />,
      to: '/admin/users?filter=inactive',
      color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    },
    {
      label: 'Draft Courses',
      description: 'Courses not yet published',
      icon: <BookX className="h-5 w-5" />,
      to: '/admin/courses?status=Draft',
      color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    },
    {
      label: 'Manage Categories',
      description: 'Add or edit course categories',
      icon: <Tags className="h-5 w-5" />,
      to: '/admin/categories',
      color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    {
      label: 'Platform Analytics',
      description: 'Full revenue and growth report',
      icon: <TrendingUp className="h-5 w-5" />,
      to: '/admin/analytics',
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    },
    {
      label: 'Low-Rated Courses',
      description: 'Courses needing attention',
      icon: <ShieldAlert className="h-5 w-5" />,
      to: '/admin/courses?sort=rating',
      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    },
    {
      label: 'Create Category',
      description: 'Add a new course category',
      icon: <PlusCircle className="h-5 w-5" />,
      to: '/admin/categories/new',
      color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    },
  ];

  const roleBadge: Record<string, string> = {
    Student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Instructor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    Admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const courseStatusBadge: Record<string, string> = {
    Published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    Archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Pending: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };


  return (
    <div className="flex flex-col gap-8 w-full p-4 md:p-6 lg:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Platform overview and management
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
          <Link to="/admin/pending-courses">
            <button className="flex items-center justify-center w-full md:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl px-6 py-3 transition-transform hover:scale-105 active:scale-95 font-semibold">
              <ClipboardCheck className="w-5 h-5" />
              Pending Approvals ({pendingCount})
            </button>
          </Link>
        </div>
      </div>

      {/* ── BENTO STATS GRID ── */}
      {statsLoading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* REVENUE (HERO WIDGET) */}
          <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 border border-indigo-400/20 shadow-2xl shadow-indigo-500/20 group transform-gpu">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 transform-gpu"></div>

            <div className="absolute -bottom-16 -right-16 text-white opacity-[0.03] transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000 ease-out pointer-events-none">
              <DollarSign className="w-96 h-96" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-100 font-medium mb-2">
                  <DollarSign className="w-5 h-5" /> Total Platform Revenue
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">{formatPrice(stats?.totalRevenue ?? 0)}</h2>
              </div>
              <div className="mt-12 flex items-center justify-between">
                <p className="text-indigo-200">Lifetime Revenue across all courses</p>
              </div>
            </div>
          </div>

          {/* USERS WIDGET */}
          <div className="relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-gray-800 shadow-lg group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                +{stats?.newUserThisMonth ?? 0} this month
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{(stats?.totalUsers ?? 0).toLocaleString()}</p>
          </div>

          {/* ENROLLMENTS WIDGET */}
          <div className="relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-gray-800 shadow-lg group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                +{thisMonthEnrollments} this month
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Enrollments</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{(stats?.totalEnrollments ?? 0).toLocaleString()}</p>
          </div>

          {/* COURSES WIDGET */}
          <div className="relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-gray-800 shadow-lg group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs text-gray-400 font-medium mt-2">{publishedCourses} published</span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Courses</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{(stats?.totalCourses ?? 0).toLocaleString()}</p>
          </div>

          {/* INSTRUCTORS WIDGET */}
          <div className="relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-gray-800 shadow-lg group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Active Instructors</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{(stats?.totalInstructors ?? 0).toLocaleString()}</p>
          </div>

          {/* RATING WIDGET */}
          <div className="md:col-span-2 relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-gray-800 shadow-lg flex items-center justify-between group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
            <div>
              <div className="flex text-amber-500 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(stats?.averageRating ?? 0)
                      ? 'fill-current'
                      : 'opacity-20'
                      }`}
                  />
                ))}
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Average Rating</h3>
              <p className="text-xs text-gray-400 mt-1">Platform average across {(stats?.totalReviews ?? 0).toLocaleString()} reviews</p>
              <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</p>
            </div>
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-100 dark:text-gray-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-500 drop-shadow-md" strokeDasharray={`${(stats?.averageRating || 0) * 20}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute text-xl font-bold text-gray-900 dark:text-white">{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</div>
            </div>
          </div>

          {/* PENDING APPROVALS WIDGET */}
          <Link to="/admin/pending-courses" className="md:col-span-2 relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-gray-800 shadow-lg flex items-center justify-between group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
            <div>
              <div className={`p-3 rounded-2xl w-max mb-6 ${pendingCount > 0 ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Pending Approvals</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{pendingCount}</p>
              <p className={`text-xs mt-1 font-medium ${pendingCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {pendingCount > 0 ? 'Needs your review' : 'All caught up!'}
              </p>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${pendingCount > 0 ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
              <ArrowRight className="w-8 h-8" />
            </div>
          </Link>

        </div>
      )}

      {/* ── PUBLISHED VS DRAFT RATIO ─────────────────────────────────────── */}
      {!statsLoading && totalCourses > 0 && (
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-lg dark:shadow-xl relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-700 transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full -mr-20 -mt-20"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">Course Publishing Ratio</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Published vs Draft breakdown</p>
              </div>
            </div>
            <Link
              to="/admin/courses"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">

            {/* Progress bar */}
            <div className="sm:col-span-2 space-y-3">
              <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>Published</span>
                <span>{publishedRatio}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${publishedRatio}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{publishedCourses} published</span>
                <span>{draftCourses} draft</span>
              </div>
            </div>

            {/* Counts */}
            <div className="flex sm:flex-col gap-3 sm:gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{publishedCourses}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70">Published</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400">{draftCourses}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70 dark:text-amber-400/70">Draft</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── QUICK ACTIONS ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-lg dark:shadow-xl">
        <h2 className="font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#181A20] hover:bg-gray-100 dark:hover:bg-[#242832] hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg shadow-indigo-500/0 group-hover:shadow-indigo-500/20 relative">
                {action.icon}
                {action.label === 'Pending Approvals' && pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-lg border-2 border-white dark:border-[#181A20]">
                    {pendingCount}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{action.label}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CHARTS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Revenue Growth</h3>
              <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Last 6 Months</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-inner">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="h-[220px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.revenue || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }} tickFormatter={(val) => val >= 1000 ? `$${(val/1000).toFixed(1)}k` : `$${val}`} />
                <Tooltip content={<CustomTooltip isCurrency />} cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-700"></div>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">New Users</h3>
              <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Last 6 Months</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="h-[220px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.users || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollments Chart */}
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors duration-700"></div>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Course Enrollments</h3>
              <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Last 6 Months</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="h-[220px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.enrollment || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F59E0B', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={4} fillOpacity={1} fill="url(#colorEnrollments)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── TOP & LOW COURSES ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* TOP PERFORMING COURSES */}
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Top Performing Courses</h2>
          </div>
          <div className="space-y-3 relative z-10">
            {topCourses?.map((course: any, idx: number) => (
              <div key={course.id} className="group/item flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-[#181A20] border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-[#242832] hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover/item:scale-110 transition-transform ${
                    idx === 0 ? 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-700/40 border border-amber-200 dark:border-amber-500/30' : 
                    idx === 1 ? 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/40 dark:to-slate-600/40 border border-slate-200 dark:border-slate-500/30' : 
                    idx === 2 ? 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-700/40 border border-orange-200 dark:border-orange-500/30' : 
                    'bg-white dark:bg-[#181A20] text-sm font-black text-gray-400 shadow-sm'
                  }`}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors line-clamp-1">{course.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <span>👥 {course.student}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                      <span className="text-amber-500">⭐ {course.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm group-hover/item:scale-110 transition-transform origin-right">{formatPrice(course.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NEEDS IMPROVEMENT */}
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/10 transition-colors duration-700"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Needs Improvement</h2>
          </div>
          <div className="space-y-3 relative z-10">
            {lowCourses?.map((course: any) => (
              <div key={course.id} className="group/item flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-[#181A20] border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-[#242832] hover:border-rose-200 dark:hover:border-rose-500/30 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#181A20] flex items-center justify-center text-gray-400 group-hover/item:text-rose-500 transition-colors shadow-sm border border-gray-100 dark:border-gray-800 shrink-0">
                    <ShieldAlert className="w-5 h-5 group-hover/item:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white group-hover/item:text-rose-600 dark:group-hover/item:text-rose-400 transition-colors line-clamp-1">{course.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <span>👥 {course.students}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                      <span className="text-rose-500">⭐ {course.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <Link to={`/admin/courses`} className="px-4 py-2 shrink-0 ml-4 rounded-xl text-[11px] font-black uppercase tracking-widest bg-white dark:bg-[#181A20] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-sm transition-all group-hover/item:shadow-md">
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RECENT USERS & COURSES + ACTIVITY + TOP INSTRUCTORS ─────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* RECENT USERS */}
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Recent Users</h2>
            </div>
            <Link to="/admin/users" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 dark:bg-[#181A20] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {usersLoading ? <LoadingSpinner /> : (
            <div className="space-y-3 relative z-10">
              {(recentUsers?.data ?? []).map((user: any) => (
                <div key={user.id} className="group/item flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#181A20] border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-[#242832] hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 text-sm font-black text-indigo-700 dark:text-indigo-300 shadow-inner group-hover/item:scale-110 transition-transform duration-500">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${roleBadge[user.role] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {user.role}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT COURSES */}
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-700"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Recent Courses</h2>
            </div>
            <Link to="/admin/courses" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 dark:bg-[#181A20] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {coursesLoading ? <LoadingSpinner /> : (
            <div className="space-y-3 relative z-10">
              {(recentCourses?.data ?? []).map((course: any) => (
                <div key={course.id} className="group/item flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#181A20] border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-[#242832] hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex h-12 w-16 overflow-hidden items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 shadow-inner group-hover/item:shadow-md transition-shadow shrink-0">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" />
                    ) : (
                      <BookOpen className="h-5 w-5 group-hover/item:scale-110 transition-transform duration-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <span className="truncate">{course.instructor?.firstName} {course.instructor?.lastName}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 shrink-0"></span>
                      <span className="shrink-0 text-blue-500">{course.enrollmentCount} students</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${courseStatusBadge[course.status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {course.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Recent Activity</h2>
          </div>
          <div className="space-y-3 relative z-10">
            {activity?.map((item: any, i: number) => (
              <div key={i} className="group/item flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#181A20] border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-[#242832] hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-md transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-xl group-hover/item:scale-110 group-hover/item:-rotate-6 transition-transform shadow-inner">
                  {item.type === "user" && "👤"}
                  {item.type === "enrollment" && "🎉"}
                  {item.type === "review" && "⭐"}
                </div>
                <div className="flex-1 pt-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors">{item.message}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{new Date(item.date).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP INSTRUCTORS */}
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-colors duration-700"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Star className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Top Instructors</h2>
          </div>
          <div className="space-y-3 relative z-10">
            {topInstructors?.map((inst: any, index: number) => (
              <div key={inst.id} className="group/item flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#181A20] border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-[#242832] hover:border-purple-200 dark:hover:border-purple-500/30 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover/item:scale-110 transition-transform ${
                    index === 0 ? 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-700/40 border border-amber-200 dark:border-amber-500/30' : 
                    index === 1 ? 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/40 dark:to-slate-600/40 border border-slate-200 dark:border-slate-500/30' : 
                    index === 2 ? 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-700/40 border border-orange-200 dark:border-orange-500/30' : 
                    'bg-white dark:bg-[#181A20] text-sm font-black text-gray-400 shadow-sm'
                  }`}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors">{inst.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <span className="text-amber-500">⭐ {inst.averageRating.toFixed(1)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                      <span>👥 {inst.totalStudents.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-purple-600 dark:text-purple-400 text-sm group-hover/item:scale-110 transition-transform origin-right">{formatPrice(inst.totalRevenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};