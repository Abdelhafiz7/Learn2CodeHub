import React, { useEffect, useState } from 'react';
import { Search, Filter, BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui';
import { CourseCard } from '@/components/course';
import { coursesApi } from '@/api';
import { useCourseStore } from '@/store';
import { getErrorMessage } from '@/utils';
import type { Category, CourseLevel } from '@/types';
import toast from 'react-hot-toast';

export const CoursesPage: React.FC = () => {
  const {
    courses,
    totalCourses,
    filters,
    isLoading,
    currentPage,
    setCourses,
    setFilters,
    setPage,
    setLoading,
    setError,
  } = useCourseStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        setFilters({ ...filters, search: searchInput, page: 1 });
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchInput]);

  useEffect(() => {
    coursesApi.getCategories().then(setCategories).catch(() => { });
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await coursesApi.getCourses(filters);
        setCourses(response.items, response.totalCount);
      } catch (err) {
        const msg = getErrorMessage(err);
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [filters]);

  const toggleLevel = (level: CourseLevel) => {
    const currentLevels = filters.level ? [filters.level] : [];
    setFilters({ ...filters, level: filters.level === level ? undefined : level, page: 1 });
  };

  const filteredCourses = React.useMemo(() => {
    let result = courses.filter(course => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchInput.toLowerCase());

      const matchesLevel =
        !filters.level || course.level === filters.level;

      const isFree = course.price === 0;
      const matchesPrice =
        selectedPrices.length === 0 ||
        (selectedPrices.includes("Free") && isFree) ||
        (selectedPrices.includes("Paid") && !isFree);

      const matchesDuration =
        selectedDurations.length === 0 ||
        selectedDurations.some(range => {
          const minutes = course.totalDuration || 0;

          if (range === "0-2") return minutes <= 120;
          if (range === "3-6") return minutes > 120 && minutes <= 360;
          if (range === "7-12") return minutes > 360 && minutes <= 720;
          if (range === "12-15") return minutes > 720 && minutes <= 900;
          if (range === "20+") return minutes > 1200;

          return true;
        });

      return matchesSearch && matchesLevel && matchesPrice && matchesDuration;
    });

    if (filters.sortBy === "newest") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }

    if (filters.sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (filters.sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    if (filters.sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    if (filters.sortBy === "popular") {
      result = [...result].sort(
        (a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
      );
    }

    return result;
  }, [
    courses,
    searchInput,
    filters.level,
    filters.sortBy,
    selectedDurations,
    selectedPrices,
  ]);

  const toggleDuration = (value: string) => {
    setSelectedDurations(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    setSelectedDurations([]);
    setSelectedPrices([]);

    setFilters({
      search: '',
      categoryId: undefined,
      level: undefined,
      page: 1,
      pageSize: 12,
      sortBy: 'newest'
    });
  };

  const totalPages = Math.ceil((totalCourses ?? 0) / (filters.pageSize ?? 12));

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] transition-colors duration-300">

      {/* HERO SECTION */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 xl:px-16 pt-12 pb-12">
        <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-bold">Catalog</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
              Explore <span className="text-indigo-600">Courses</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              Discover world-class courses designed to help you master new skills and advance your career.
              Join over 50,000 students learning today.
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
            <span className="text-sm font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">
              {filteredCourses.length} Courses Available
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-24 items-start">

        {/* SIDEBAR FILTERS */}
        <aside className="lg:col-span-3 sticky top-8 space-y-10 lg:border-r lg:border-gray-200 dark:lg:border-gray-800 lg:pr-10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Filter className="w-6 h-6 text-indigo-600" />
              Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg"
            >
              Reset
            </button>
          </div>

          <div className="space-y-10">
            {/* SEARCH (Mobile Only or additional) */}
            <div className="lg:hidden">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* CATEGORIES */}
            <div className="space-y-5">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Category</h4>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categoryId === cat.id}
                        onChange={() => setFilters({ ...filters, categoryId: filters.categoryId === cat.id ? undefined : cat.id, page: 1 })}
                        className="peer h-5 w-5 appearance-none rounded-lg border-2 border-gray-300 dark:border-gray-700 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                      />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* LEVEL */}
            <div className="space-y-5">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Difficulty</h4>
              <div className="space-y-3">
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => {
                  const dotColor =
                    level === "Beginner" ? "bg-emerald-500" :
                      level === "Intermediate" ? "bg-amber-500" :
                        "bg-rose-500";
                  return (
                    <label key={level} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.level === level}
                          onChange={() => toggleLevel(level as CourseLevel)}
                          className="peer h-5 w-5 appearance-none rounded-lg border-2 border-gray-300 dark:border-gray-700 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                        />
                        <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {level}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* DURATION */}
            <div className="space-y-5">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Duration</h4>
              <div className="space-y-3">
                {[
                  { label: "0–2 hours", value: "0-2" },
                  { label: "3–6 hours", value: "3-6" },
                  { label: "7–12 hours", value: "7-12" },
                  { label: "12–15 hours", value: "12-15" },
                  { label: "20+ hours", value: "20+" },
                ].map((d) => (
                  <label key={d.value} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedDurations.includes(d.value)}
                        onChange={() => toggleDuration(d.value)}
                        className="peer h-5 w-5 appearance-none rounded-lg border-2 border-gray-300 dark:border-gray-700 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                      />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {d.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* PRICE */}
            <div className="space-y-5">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                Price
              </h4>

              <div className="space-y-3">
                {['Free', 'Paid'].map((p) => {
                  const dotColor =
                    p === "Free" ? "bg-emerald-500" : "bg-indigo-500";

                  return (
                    <label key={p} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedPrices.includes(p)}
                          onChange={() =>
                            setSelectedPrices(prev =>
                              prev.includes(p)
                                ? prev.filter(x => x !== p)
                                : [...prev, p]
                            )
                          }
                          className="peer h-5 w-5 appearance-none rounded-lg border-2 border-gray-300 dark:border-gray-700 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                        />
                        <svg
                          className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>

                      {/* DOT like Level */}
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />

                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {p}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="lg:col-span-9 space-y-10">

          {/* SEARCH & SORT */}
          <div className="flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for courses, skills, or topics..."
                className="w-full pl-16 pr-8 py-5 bg-gray-50 dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-lg"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400 shrink-0">Sort By</span>
              <div className="relative w-full">
                <select
                  value={filters.sortBy || 'newest'}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any, page: 1 })}
                  className="appearance-none px-8 py-5 bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm w-full pr-12"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* GRID */}
          {isLoading ? (
            <div className="py-24">
              <LoadingSpinner fullPage={false} text="Curating the best courses for you..." />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-32 text-center bg-gray-50 dark:bg-[#1C1F26]/30 rounded-[4rem] border border-dashed border-gray-300 dark:border-gray-800">
              <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">No courses found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-sm mx-auto text-lg">
                We couldn't find any courses matching your current filters. Try resetting or adjusting your search.
              </p>
              <button
                onClick={clearFilters}
                className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {filteredCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="animate-in fade-in slide-in-from-bottom-8"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-24 flex items-center justify-center gap-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="px-8 py-4 bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-2xl font-black text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-50 transition-all hover:border-indigo-500"
                  >
                    Previous
                  </button>
                  <div className="flex gap-3">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Simple sliding window or just first 5 for now
                      return i + 1;
                    }).map((page) => (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`w-14 h-14 rounded-2xl font-black transition-all ${currentPage === page
                          ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 scale-110'
                          : 'bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 hover:border-indigo-500'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className="px-8 py-4 bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-2xl font-black text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-50 transition-all hover:border-indigo-500"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};  