import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { coursesApi } from "@/api";
import { LoadingSpinner } from "@/components/ui";
import { CourseCard } from "@/components/course";
import type { Category, Course, CourseLevel } from "@/types";
import { CATEGORY_ICONS } from "@/categoryIcons";
import {
  ChevronRight,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";

export const CategoryDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [relatedCategories, setRelatedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<CourseLevel[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevant");
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLevels([]);
    setSelectedPrices([]);
    setSelectedDurations([]);
    setSortBy("relevant");
  };

  const toggleDuration = (value: string) => {
    setSelectedDurations(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const catRes = await coursesApi.getCategories();
        const current = catRes.find((c: Category) => String(c.id) === String(id));
        setCategory(current || null);

        if (id) {
          const related = await coursesApi.getRelatedCategories(id);
          setRelatedCategories(related);
        }

        const courseRes = await coursesApi.getCourses({
          categoryId: String(id),
          pageSize: 100,
        });

        setCourses(courseRes.items);
      } catch (err) {
        console.error("Failed to load category page", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const filteredCourses = useMemo(() => {
    let result = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel =
        selectedLevels.length === 0 || selectedLevels.includes(course.level);

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

    if (sortBy === "newest") {
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [courses, searchQuery, selectedLevels, selectedPrices, selectedDurations, sortBy]);

  const toggleLevel = (level: CourseLevel) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const togglePrice = (price: string) => {
    setSelectedPrices(prev =>
      prev.includes(price) ? prev.filter(p => p !== price) : [...prev, price]
    );
  };

  if (loading) return <LoadingSpinner fullPage text="Loading Category..." />;
  if (!category) return <div className="min-h-screen flex items-center justify-center">Category not found</div>;

  const match = CATEGORY_ICONS.find((i) => i.name === category.icon);
  const IconComponent = match?.icon;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] transition-colors duration-300">

      {/* HEADER / HERO SECTION */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-8 pb-12">

        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Catalog</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-gray-900 dark:text-white">{category.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-gray-200 dark:border-gray-800 pb-12">
          {/* MAIN HERO CONTENT */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                {IconComponent ? (
                  <IconComponent className="h-8 w-8 md:h-10 md:w-10 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <span className="text-2xl font-black text-indigo-600">{category.name.charAt(0)}</span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                {category.name} <span className="text-indigo-600">courses</span>
              </h1>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">About {category.name}</h2>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                {category.description || `Master the art of ${category.name} with our comprehensive learning paths. From fundamentals to advanced specialized techniques, we've got you covered.`}
              </p>
            </div>
          </div>

          {/* RELATED TOPICS SIDEBAR */}
          <div className="lg:col-span-4 lg:border-l lg:border-gray-200 dark:lg:border-gray-800 lg:pl-12 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-700">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Related topics
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {relatedCategories.length > 0 ? (
                relatedCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/categories/${cat.id}`)}
                    className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group"
                  >
                    {cat.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">Exploring more topics...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">

        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="lg:col-span-3 sticky top-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 lg:border-r lg:border-gray-200 dark:lg:border-gray-800 lg:pr-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h3>

            <button
              onClick={clearFilters}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="space-y-6">
            {/* LEVEL FILTER */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Level</h4>
              <div className="space-y-3">
                {["Beginner", "Intermediate", "Advanced"].map((level) => {
                  const dotColor = 
                    level === "Beginner" ? "bg-emerald-500" :
                    level === "Intermediate" ? "bg-amber-500" :
                    "bg-rose-500";
                  return (
                    <label key={level} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(level as CourseLevel)}
                          onChange={() => toggleLevel(level as CourseLevel)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 dark:border-gray-700 transition-all checked:bg-indigo-600 checked:border-indigo-600"
                        />
                        <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{level}</span>
                    </label>
                  );
                })}
                {/* DURATION FILTER */}
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                    Duration
                  </h4>

                  <div className="space-y-3">
                    {[
                      { label: "0–2 hours", value: "0-2" },
                      { label: "3–6 hours", value: "3-6" },
                      { label: "7–12 hours", value: "7-12" },
                      { label: "12–15 hours", value: "12-15" },
                      { label: "20+ hours", value: "20+" },
                    ].map(item => (
                      <label key={item.value} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedDurations.includes(item.value)}
                            onChange={() => toggleDuration(item.value)}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 dark:border-gray-700 transition-all checked:bg-indigo-600 checked:border-indigo-600"
                          />
                          <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>

                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PRICE FILTER */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Price</h4>
              <div className="space-y-3">
                {["Free", "Paid"].map((price) => (
                  <label key={price} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPrices.includes(price)}
                        onChange={() => togglePrice(price)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 dark:border-gray-700 transition-all checked:bg-indigo-600 checked:border-indigo-600"
                      />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{price}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="lg:col-span-9 space-y-8">

          {/* SEARCH & SORT BAR */}
          <div className="flex flex-col md:flex-row gap-4 items-center animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${category.name} courses...`}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm w-full md:w-auto"
            >
              <option value="relevant">Most relevant</option>
              <option value="newest">Newest first</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
            </select>
          </div>

          {/* COURSES GRID */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
          ) : (
            <div className="text-center py-24 bg-gray-50 dark:bg-[#1C1F26]/30 rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matching courses</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms.</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedLevels([]); setSelectedPrices([]); }}
                className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};