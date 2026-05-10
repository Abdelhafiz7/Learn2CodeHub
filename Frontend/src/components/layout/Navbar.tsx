import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, ChevronDown, LogOut, User, LayoutDashboard, Sun, Moon, ChevronRight, Monitor, Network, Briefcase, ArrowRight } from 'lucide-react';
import { useAuthStore, useThemeStore, useCourseStore } from '@/store';
import { Avatar } from '@/components/ui';
import { coursesApi } from '@/api';
import type { Category } from '@/types';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import logoUrl from '@/assets/Learn2codehub.png';
import { CATEGORY_ICONS } from '@/categoryIcons';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { setFilters } = useCourseStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    coursesApi.getCategories().then(setCategories).catch(() => { });
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
    setDropdownOpen(false);
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'Admin': return '/admin/dashboard';
      case 'Instructor': return '/instructor/dashboard';
      default: return '/student/dashboard';
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm transition-colors duration-200">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logoUrl} alt="Learn To Code Hub" className="h-8 w-auto invert dark:invert-0" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-6 md:flex">
            {/* Categories Dropdown */}
            <div>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Categories
                <ChevronDown className="h-4 w-4" />
              </button>

              {categoriesOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10 bg-black/5 dark:bg-black/40 backdrop-blur-[2px]"
                    onClick={() => setCategoriesOpen(false)}
                  />
                  <div className="absolute left-6 right-6 top-16 z-20 flex min-h-[450px] overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-none animate-in fade-in slide-in-from-top-4 duration-200">
                    {/* Left Sidebar */}
                    <div className="w-[280px] flex-shrink-0 bg-gray-50 dark:bg-indigo-950/20 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-2">
                      <button className="flex w-full items-center justify-between rounded-xl bg-white dark:bg-indigo-600 p-4 text-sm font-semibold text-indigo-700 dark:text-white shadow-sm border border-gray-200 dark:border-indigo-500/50">
                        <span className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-indigo-600 dark:text-white" /> Course topics</span>
                        <ChevronRight className="h-5 w-5 text-indigo-400 dark:text-white" />
                      </button>
                      <button className="flex w-full items-center justify-between rounded-xl p-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-900 transition-colors">
                        <span className="flex items-center gap-3"><Monitor className="h-5 w-5 text-gray-400 dark:text-gray-500" /> Live learning</span>
                      </button>
                      <button className="flex w-full items-center justify-between rounded-xl p-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-900 transition-colors">
                        <span className="flex items-center gap-3"><Network className="h-5 w-5 text-gray-400 dark:text-gray-500" /> Skill paths</span>
                      </button>
                      <button className="flex w-full items-center justify-between rounded-xl p-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-900 transition-colors">
                        <span className="flex items-center gap-3"><Briefcase className="h-5 w-5 text-gray-400 dark:text-gray-500" /> Career paths</span>
                      </button>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 p-10 flex flex-col">
                      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Course topics</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-3xl text-sm leading-relaxed">
                        Explore free or paid courses in a wide variety of topics. With something for every skill level, it's easy to find a course that fits your goals.
                      </p>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Popular subjects</h3>
                      {categories.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                          {categories.map((cat) => {
                            const match = CATEGORY_ICONS.find(i => i.name === cat.icon);
                            const IconComponent = match?.icon;

                            return (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  setCategoriesOpen(false);
                                  navigate(`/categories/${cat.id}`); // ✅ correct
                                }}
                                className=" flex items-center gap-3
                                  px-4 py-3 rounded-xl
                                  border border-gray-200 dark:border-gray-800
                                  hover:bg-indigo-50 dark:hover:bg-gray-900
                                  transition group
                                "
                              >
                                {/* ICON */}
                                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                  {IconComponent ? (
                                    <IconComponent className="h-5 w-5 text-indigo-500" />
                                  ) : (
                                    <span className="text-gray-400">
                                      {cat.name.charAt(0)}
                                    </span>
                                  )}
                                </div>

                                {/* TEXT */}
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {cat.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
                          Loading catalog...
                        </div>
                      )}

                      <div className="mt-auto flex justify-center py-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => {
                            setCategoriesOpen(false);
                            navigate('/courses');
                          }}
                          className="text-indigo-700 dark:text-indigo-400 font-bold hover:underline flex items-center gap-2 text-[15px]"
                        >
                          Explore the full catalog <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              to="/courses"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Browse Courses
            </Link>
            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Avatar
                    firstName={user.firstName}
                    lastName={user.lastName}
                    imageUrl={user.profileImageUrl}
                    size="sm"
                  />
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {user.firstName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-2 shadow-lg">
                      <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        <span className="mt-1 inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                          {user.role}
                        </span>
                      </div>
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        to={`/${user?.role.toLowerCase()}/profile`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              to="/courses"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              Browse Courses
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className={clsx(
                    'rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50'
                  )}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
