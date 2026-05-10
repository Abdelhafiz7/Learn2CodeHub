import React, { useEffect, useState, useMemo } from "react";
import { coursesApi } from "@/api";
import type { Category } from "@/types";
import { LoadingSpinner } from "@/components/ui";
import { useNavigate, Link } from "react-router-dom";
import { CATEGORY_ICONS } from "@/categoryIcons";
import { PlusCircle, Layers, Search, BookOpen, Edit, Trash } from "lucide-react";
import toast from "react-hot-toast";

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await coursesApi.getCategories();
      setCategories(data);
    } catch {
      console.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to completely delete this category? This action cannot be undone.')) return;

    setActionLoading(id);
    try {
      await coursesApi.deleteCategory(id);
      toast.success('Category deleted successfully!');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = useMemo(() => {
    return categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  return (
    <div className="flex flex-col gap-8 w-full p-4 md:p-6 lg:p-8">
      {/* HERO HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Manage Categories
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {categories.length} total categories • Organized subjects
            </p>
          </div>
        </div>

        <Link to="/admin/categories/new" className="shrink-0">
          <button className="flex items-center justify-center w-full md:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl px-6 py-3 transition-transform hover:scale-105 active:scale-95 font-semibold">
            <PlusCircle className="w-5 h-5" />
            Create New Category
          </button>
        </Link>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search categories by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-lg dark:shadow-xl transition-all"
        />
      </div>

      {/* CONTENT GRID */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center shadow-lg">
           <Layers className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-gray-900 dark:text-white">
             {search.trim() ? `No results for "${search}"` : 'No categories yet'}
           </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((cat) => {
            const match = CATEGORY_ICONS.find((i) => i.name === cat.icon);
            const IconComponent = match?.icon;

            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/courses?categoryId=${cat.id}`)}
                className="group cursor-pointer flex flex-col bg-white dark:bg-[#1C1F26] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 relative"
              >
                {/* Top Image/Color Block */}
                <div className="h-36 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-[#1A1C23] dark:to-[#111318] flex items-center justify-center relative overflow-hidden group-hover:from-indigo-100/80 group-hover:to-purple-100/80 dark:group-hover:from-[#1E212B] dark:group-hover:to-[#161922] transition-colors duration-500 border-b border-indigo-100/50 dark:border-gray-800">
                  {/* Glowing orb behind the icon */}
                  <div className="absolute w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/20 dark:group-hover:bg-indigo-500/40 group-hover:scale-150 transition-all duration-700 ease-out"></div>
                  
                  {/* Grid pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

                  {IconComponent ? (
                    <IconComponent size={56} className="text-indigo-600/60 dark:text-gray-300 relative z-10 group-hover:scale-110 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-500" />
                  ) : (
                    <span className="text-5xl font-black text-indigo-600/60 dark:text-gray-300 relative z-10 group-hover:scale-110 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-500 opacity-90">
                      {cat.name.charAt(0)}
                    </span>
                  )}

                  {/* Actions Hover Overlay */}
                  <div className="absolute inset-0 bg-gray-900/60 dark:bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/categories/${cat.id}/edit`); }} 
                      className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl" 
                      title="Edit Category"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(cat.id.toString()); }} 
                      disabled={actionLoading === cat.id.toString()}
                      className="w-10 h-10 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all shadow-lg disabled:opacity-50" 
                      title="Delete Category"
                    >
                      {actionLoading === cat.id.toString() ? <LoadingSpinner size="sm" /> : <Trash className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Bottom Content Block */}
                <div className="p-6 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{cat.courseCount} Courses</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};