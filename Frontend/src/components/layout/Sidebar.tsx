import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  PlusCircle,
  Settings,
  Users,
  BookMarked,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Sun,
  Moon,
  ClipboardCheck,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore, useThemeStore } from '@/store';
import { useApi } from '@/hooks';
import { Avatar } from '@/components/ui';
import toast from 'react-hot-toast';
import logoUrl from '@/assets/Learn2codehub.png';
import faviconUrl from '@/assets/Favicon.png';
import { adminApi } from '@/api/adminApi';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: number;
}

const studentNav: NavItem[] = [
  { label: 'Dashboard',      to: '/student/dashboard',  icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Courses',     to: '/student/my-courses', icon: <BookMarked className="h-5 w-5" /> },
  { label: 'Browse Courses', to: '/courses',             icon: <BookOpen className="h-5 w-5" /> },
];

const instructorNav: NavItem[] = [
  { label: 'Dashboard',     to: '/instructor/dashboard',    icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Courses',    to: '/instructor/courses',      icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Create Course', to: '/instructor/courses/new',  icon: <PlusCircle className="h-5 w-5" /> },
  { label: 'Analytics',     to: '/instructor/analytics',    icon: <BarChart3 className="h-5 w-5" /> },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  // Fetch pending courses count — only when admin
  const { data: pendingCourses, refetch: refetchPending } = useApi(
    () => user?.role === 'Admin' ? adminApi.getPendingCourses() : Promise.resolve([]),
    [user?.role]
  );

  // Poll every 30 seconds so the badge updates without a manual reload
  useEffect(() => {
    if (user?.role !== 'Admin') return;
    const interval = setInterval(() => {
      refetchPending();
    }, 30_000);
    return () => clearInterval(interval);
  }, [user?.role, refetchPending]);

  const pendingCount: number = pendingCourses?.length ?? 0;

  // Build adminNav dynamically so badge is reactive
  const adminNav: NavItem[] = [
    { label: 'Dashboard',         to: '/admin/dashboard',        icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Manage Users',      to: '/admin/users',            icon: <Users className="h-5 w-5" /> },
    { label: 'Manage Courses',    to: '/admin/courses',          icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Pending Approvals', to: '/admin/pending-courses',  icon: <ClipboardCheck className="h-5 w-5" />, badge: pendingCount },
    { label: 'Manage Categories', to: '/admin/categories',       icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Analytics',         to: '/admin/analytics',        icon: <BarChart3 className="h-5 w-5" /> },
    { label: 'Settings',          to: '/admin/settings',         icon: <Settings className="h-5 w-5" /> },
  ];

  const navItems =
    user?.role === 'Admin'
      ? adminNav
      : user?.role === 'Instructor'
      ? instructorNav
      : studentNav;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside
      className={clsx(
        'flex h-screen flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-100 dark:border-gray-800 px-4">
        {collapsed ? (
          <img src={faviconUrl} alt="Learn To Code Hub" className="h-8 w-8 object-contain flex-shrink-0" />
        ) : (
          <img src={logoUrl} alt="Learn To Code Hub" className="h-8 w-auto flex-shrink-0 invert dark:invert-0" />
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white',
                    collapsed && 'justify-center'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                {/* Icon with dot badge when collapsed */}
                <div className="relative shrink-0">
                  {item.icon}
                  {collapsed && item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  ) : null}
                </div>

                {/* Label + pill badge when expanded */}
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Actions */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3 flex flex-col gap-1">
        {user && !collapsed && (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar
              firstName={user.firstName}
              lastName={user.lastName}
              imageUrl={user.profileImageUrl}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={clsx(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400',
            'hover:bg-gray-100 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white transition-colors',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Toggle Theme' : undefined}
        >
          {isDarkMode ? <Sun className="h-5 w-5 flex-shrink-0" /> : <Moon className="h-5 w-5 flex-shrink-0" />}
          {!collapsed && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button
          onClick={handleLogout}
          className={clsx(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400',
            'hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 transition-colors',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};