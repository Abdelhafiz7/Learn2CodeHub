import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Menu, X, ChevronDown, LogOut, User, LayoutDashboard,
  Sun, Moon, ChevronRight, Monitor, Network, Briefcase, ArrowRight,
  Search, Sparkles
} from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    coursesApi.getCategories().then(setCategories).catch(() => { });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/courses?search=${encodeURIComponent(search.trim())}`);
    setSearch('');
    searchRef.current?.blur();
  };

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
    <nav className={clsx(
      'sticky top-0 z-40 transition-all duration-500',
      isDarkMode
        ? 'bg-gray-950 border-b border-gray-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
        : 'bg-gradient-to-r from-indigo-800 via-indigo-600 to-violet-700 border-b border-indigo-500/30 shadow-xl shadow-indigo-900/20'
    )}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src={logoUrl}
              alt="Learn To Code Hub"
              className={clsx('h-8 w-auto transition-all duration-300', isDarkMode ? 'invert-0' : 'brightness-0 invert')}
            />
          </Link>

          {/* ── Search Bar (Desktop) ── */}
          <form
            onSubmit={handleSearch}
            className={clsx(
              "hidden md:flex items-center transition-all duration-500 ease-in-out relative z-50",
              searchFocused ? "w-full max-w-lg mx-4" : "w-full max-w-[240px] mx-6"
            )}
          >
            <div className={clsx(
              'relative w-full rounded-2xl transition-all duration-300 group',
              searchFocused
                ? isDarkMode
                  ? 'ring-4 ring-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                  : 'ring-4 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                : 'hover:shadow-md'
            )}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <Search className={clsx(
                  'h-5 w-5 transition-colors duration-300',
                  searchFocused
                    ? 'text-indigo-500'
                    : isDarkMode ? 'text-gray-400' : 'text-white/70'
                )} />
              </div>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search for courses, skills..."
                className={clsx(
                  'w-full rounded-2xl px-5 py-2 text-sm font-bold transition-all duration-300 focus:outline-none',
                  isDarkMode
                    ? 'bg-gray-900/80 border border-gray-800 text-gray-100 placeholder-gray-500 focus:bg-gray-950 focus:border-indigo-500/50 backdrop-blur-md'
                    : 'bg-white/15 border border-white/25 text-white placeholder-white/70 focus:bg-white/25 backdrop-blur-xl'
                )}
              />
              {!search && !searchFocused && (
                <div className={clsx(
                  "absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-black uppercase tracking-tighter opacity-40",
                  isDarkMode ? "border-gray-700 text-gray-400" : "border-white/30 text-white"
                )}>
                  <span>CMD</span>
                  <span>K</span>
                </div>
              )}
              {search && (
                <button
                  type="submit"
                  className={clsx(
                    'absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-1.5 transition-all hover:scale-110 active:scale-95',
                    isDarkMode
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-white text-indigo-700 shadow-lg'
                  )}
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className={clsx(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-all',
                  isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                )}
              >
                Categories
                <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform duration-300', categoriesOpen && 'rotate-180')} />
              </button>

              {categoriesOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10 bg-black/40 backdrop-blur-[4px]"
                    onClick={() => setCategoriesOpen(false)}
                  />
                  <div className={clsx(
                    'absolute left-[-500px] top-14 z-20 flex min-h-[500px] w-[1250px] overflow-hidden rounded-[2.5rem] border shadow-[0_40px_120px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-top-4 duration-300',
                    isDarkMode
                      ? 'bg-gray-950 border-gray-800'
                      : 'bg-white border-gray-100'
                  )}>
                    {/* Left Sidebar */}
                    <div className={clsx(
                      'w-[300px] flex-shrink-0 border-r p-8 flex flex-col gap-3',
                      isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'
                    )}>
                      {[
                        { icon: BookOpen, label: 'Course topics', active: true },
                        { icon: Network, label: 'Skill paths', active: false },
                        { icon: Briefcase, label: 'Career paths', active: false },
                      ].map(({ icon: Icon, label, active }) => (
                        <button
                          key={label}
                          className={clsx(
                            'flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-sm font-black transition-all text-left',
                            active
                              ? isDarkMode
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                              : isDarkMode
                                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 p-10 flex flex-col">
                      <div className="flex items-center gap-4 mb-2">
                        <Sparkles className="h-6 w-6 text-indigo-500" />
                        <h2 className={clsx('text-2xl font-black tracking-tight', isDarkMode ? 'text-white' : 'text-gray-900')}>
                          Course Topics
                        </h2>
                      </div>
                      <p className={clsx('text-sm mb-6 font-bold', isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
                        Find the perfect course for your goals and master new skills
                      </p>

                      {categories.length > 0 ? (
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          {categories.map((cat) => {
                            const match = CATEGORY_ICONS.find(i => i.name === cat.icon);
                            const IconComponent = match?.icon;
                            return (
                              <button
                                key={cat.id}
                                onClick={() => { setCategoriesOpen(false); navigate(`/categories/${cat.id}`); }}
                                className={clsx(
                                  'flex items-center gap-3 p-4 rounded-3xl border text-left transition-all group relative overflow-hidden',
                                  isDarkMode
                                    ? 'border-gray-800 hover:border-indigo-500/50 hover:bg-indigo-950/40 text-gray-300 hover:text-white'
                                    : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-gray-700 hover:text-indigo-700 hover:shadow-xl hover:shadow-indigo-500/10'
                                )}
                              >
                                <div className={clsx(
                                  'w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6',
                                  isDarkMode 
                                    ? 'bg-gray-800 group-hover:bg-indigo-500/20 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                                    : 'bg-gray-50 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-indigo-500/20'
                                )}>
                                  {IconComponent
                                    ? <IconComponent className="h-5 w-5 text-indigo-500" />
                                    : <span className="text-base font-black text-indigo-500 uppercase">{cat.name.charAt(0)}</span>
                                  }
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-black tracking-tight">{cat.name}</span>
                                </div>
                                
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-indigo-500" />
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={clsx('flex items-center justify-center py-12 text-sm font-bold', isDarkMode ? 'text-gray-500' : 'text-gray-400')}>
                          Loading topics...
                        </div>
                      )}

                      <div className={clsx('mt-auto pt-4 border-t', isDarkMode ? 'border-gray-800' : 'border-gray-100')}>
                        <button
                          onClick={() => { setCategoriesOpen(false); navigate('/courses'); }}
                          className="flex items-center gap-2 text-sm font-black text-indigo-500 hover:text-indigo-400 transition-all hover:translate-x-1"
                        >
                          Explore full catalog <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              to="/courses"
              className={clsx(
                'rounded-lg px-3 py-2 text-sm font-bold transition-all',
                isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              )}
            >
              Browse Courses
            </Link>

            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                className={clsx(
                  'rounded-lg px-3 py-2 text-sm font-bold transition-all',
                  isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                )}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* ── Desktop Auth ── */}
          <div className="hidden items-center gap-3 md:flex flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={clsx(
                'rounded-xl p-3 transition-all',
                isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              )}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={clsx(
                    'flex items-center gap-3 rounded-2xl px-4 py-2 text-sm transition-all',
                    isDarkMode
                      ? 'hover:bg-gray-800 text-gray-200'
                      : 'hover:bg-white/15 text-white'
                  )}
                >
                  <Avatar
                    firstName={user.firstName}
                    lastName={user.lastName}
                    imageUrl={user.profileImageUrl}
                    size="sm"
                  />
                  <span className="font-bold">{user.firstName}</span>
                  <ChevronDown className={clsx('h-3.5 w-3.5 opacity-60 transition-transform duration-300', dropdownOpen && 'rotate-180')} />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className={clsx(
                      'absolute right-0 z-20 mt-3 w-64 rounded-3xl border py-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
                      isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    )}>
                      <div className={clsx('px-6 py-4 mb-2 border-b', isDarkMode ? 'border-gray-800' : 'border-gray-100')}>
                        <p className={clsx('text-base font-black tracking-tight', isDarkMode ? 'text-white' : 'text-gray-900')}>
                          {user.firstName} {user.lastName}
                        </p>
                        <p className={clsx('text-xs mt-0.5 font-medium', isDarkMode ? 'text-gray-400' : 'text-gray-500')}>{user.email}</p>
                        <span className="mt-3 inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                          {user.role}
                        </span>
                      </div>

                      {[
                        { to: getDashboardPath(), icon: LayoutDashboard, label: 'Dashboard' },
                        { to: `/${user?.role.toLowerCase()}/profile`, icon: User, label: 'Profile' },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link
                          key={label}
                          to={to}
                          onClick={() => setDropdownOpen(false)}
                          className={clsx(
                            'flex items-center gap-3 px-6 py-3 text-sm font-bold transition-colors',
                            isDarkMode
                              ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          )}
                        >
                          <Icon className="h-4 w-4 opacity-60" />
                          {label}
                        </Link>
                      ))}

                      <div className={clsx('my-2 border-t', isDarkMode ? 'border-gray-800' : 'border-gray-100')} />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-6 py-3 text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4 opacity-70" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={clsx(
                    'rounded-lg px-3 py-2 text-sm font-bold transition-all',
                    isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  )}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={clsx(
                    'rounded-xl px-4 py-2 text-sm font-black transition-all shadow-xl',
                    isDarkMode
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
                      : 'bg-white text-indigo-700 hover:bg-indigo-50 shadow-white/30'
                  )}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Menu Button ── */}
          <button
            className={clsx(
              'rounded-xl p-3 md:hidden transition-colors',
              isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-white hover:bg-white/15'
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className={clsx(
          'border-t md:hidden px-4 py-6',
          isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-indigo-800 border-indigo-500/40'
        )}>
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative mb-6">
            <div className={clsx(
              "relative rounded-xl overflow-hidden transition-all duration-300",
              isDarkMode ? "bg-gray-800 shadow-lg shadow-black/20" : "bg-white/10 shadow-lg shadow-indigo-950/20"
            )}>
              <Search className={clsx(
                'absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5',
                isDarkMode ? 'text-gray-400' : 'text-white/70'
              )} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className={clsx(
                  'w-full rounded-xl px-4 py-4 pl-12 text-sm font-bold focus:outline-none transition-all',
                  isDarkMode
                    ? 'bg-transparent text-white placeholder-gray-500 border border-gray-700 focus:border-indigo-500/50'
                    : 'bg-transparent text-white placeholder-white/60 border border-white/20 focus:bg-white/10'
                )}
              />
              {search && (
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-500 text-white p-2 rounded-lg"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>

          <div className="flex flex-col gap-2">
            <Link
              to="/courses"
              className={clsx(
                'rounded-xl px-4 py-3.5 text-sm font-bold transition-colors',
                isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-white/90 hover:bg-white/15 hover:text-white'
              )}
              onClick={() => setMobileOpen(false)}
            >
              Browse Courses
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className={clsx(
                    'rounded-xl px-4 py-3.5 text-sm font-bold transition-colors',
                    isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-white/90 hover:bg-white/15 hover:text-white'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="rounded-xl px-4 py-3.5 text-left text-sm font-bold text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={clsx(
                    'rounded-xl px-4 py-3.5 text-sm font-bold transition-colors',
                    isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-white/90 hover:bg-white/15'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={clsx(
                    'rounded-2xl px-4 py-4 text-center text-sm font-black transition-colors',
                    isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white text-indigo-700 hover:bg-indigo-50'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-colors mt-2',
                isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
              )}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
