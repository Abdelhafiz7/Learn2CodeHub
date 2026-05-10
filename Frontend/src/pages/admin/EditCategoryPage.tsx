import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, LoadingSpinner } from "@/components/ui";
import toast from "react-hot-toast";
import { coursesApi } from "@/api";
import { CATEGORY_ICONS } from "@/categoryIcons";
import { Layers, Image as ImageIcon, Eye, BookOpen } from "lucide-react";

export const EditCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [iconSearch, setIconSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [courseCount, setCourseCount] = useState(0);

  useEffect(() => {
    const loadCategory = async () => {
      if (!id) return;
      try {
        const cat = await coursesApi.getCategoryById(id);
        setName(cat.name);
        setDescription(cat.description || "");
        setSelectedIcon(cat.icon);
        setCourseCount(cat.courseCount || 0);
      } catch (err) {
        toast.error("Failed to load category details");
        navigate("/admin/categories");
      } finally {
        setInitialLoading(false);
      }
    };
    loadCategory();
  }, [id, navigate]);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return CATEGORY_ICONS;
    return CATEGORY_ICONS.filter((i) =>
      i.name.toLowerCase().includes(iconSearch.toLowerCase())
    );
  }, [iconSearch]);

  const selectedIconEntry = CATEGORY_ICONS.find((i) => i.name === selectedIcon);

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (!selectedIcon) {
      toast.error("Please select an icon");
      return;
    }
    try {
      setLoading(true);
      await coursesApi.updateCategory(id!, {
        name,
        description,
        icon: selectedIcon,
      });
      toast.success("Category updated successfully!");
      navigate("/admin/categories");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner fullPage text="Loading category details..." />;
  }

  return (
    <div className="flex flex-col gap-8 w-full p-4 md:p-6 lg:p-8">
      {/* HERO HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-400/20 blur-xl rounded-full"></div>
            <Layers className="w-7 h-7 relative z-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Edit Category
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update the learning taxonomy details.
            </p>
          </div>
        </div>
      </div>

      {/* FORM CONTAINER - SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: DETAILS */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col h-full">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[80px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>

          <div className="mb-8 relative z-10 shrink-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Category Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Basic information about the subject.</p>
          </div>

          <div className="space-y-6 relative z-10 flex flex-col shrink-0">
            {/* NAME */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Category Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 py-3.5 px-4 rounded-xl shadow-none"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#13151A] text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn in this category..."
              />
            </div>
          </div>

          {/* LIVE PREVIEW */}
          <div className="flex-1 flex flex-col justify-end pt-6 min-h-[220px]">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" /> Live Card Preview
            </label>
            
            <div className="w-full max-w-sm mx-auto group flex flex-col bg-white dark:bg-[#1C1F26] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md">
              {/* Top Image/Color Block */}
              <div className="h-32 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-[#1A1C23] dark:to-[#111318] flex items-center justify-center relative overflow-hidden border-b border-indigo-100/50 dark:border-gray-800">
                <div className="absolute w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl"></div>
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {selectedIconEntry ? (
                  <selectedIconEntry.icon size={48} className="text-indigo-600/60 dark:text-gray-300 relative z-10" />
                ) : (
                  <span className="text-4xl font-black text-indigo-600/60 dark:text-gray-300 relative z-10 opacity-90">
                    {name ? name.charAt(0).toUpperCase() : "?"}
                  </span>
                )}
              </div>

              {/* Bottom Content Block */}
              <div className="p-5 flex flex-col gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">
                  {name || "Category Name"}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{courseCount} Courses</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800/60 relative z-10 shrink-0">
            <Button 
              onClick={handleUpdate} 
              isLoading={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-4 font-bold shadow-lg shadow-indigo-500/20 transition-transform hover:scale-[1.02] active:scale-[0.98] text-lg"
            >
              Update Category
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: ICON PICKER */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl h-full flex flex-col">
          <div className="flex items-center justify-between mb-8 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
                Visual Icon
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select a premium icon to represent this subject.</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
              {filteredIcons.length} icons available
            </span>
          </div>

          {/* SELECTED ICON PREVIEW */}
          {selectedIconEntry && (
            <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30 shadow-inner shrink-0">
              <div className="p-3 bg-white dark:bg-indigo-500/20 rounded-xl shadow-sm">
                <selectedIconEntry.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <span className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold block mb-0.5">Selected Icon</span>
                <span className="text-base font-bold text-gray-900 dark:text-white">
                  {selectedIcon}
                </span>
              </div>
              <button
                onClick={() => setSelectedIcon("")}
                className="ml-auto text-sm font-semibold px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* SEARCH BAR */}
          <div className="relative mb-6 shrink-0 group">
            <input
              type="text"
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              placeholder="Search icon library..."
              className="w-full px-4 py-4 pl-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#13151A] text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>

          {/* ICON GRID - Fixed Height / Flex-1 to prevent expanding parent */}
          <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-0 overflow-y-auto pr-3 custom-scrollbar">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 pb-4">
                {filteredIcons.length > 0 ? (
                  filteredIcons.map(({ name: iconName, icon: Icon }) => (
                    <button
                      key={iconName}
                      onClick={() => setSelectedIcon(iconName)}
                      title={iconName}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                        selectedIcon === iconName
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/30 scale-105 z-10"
                          : "bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-[10px] font-semibold text-center truncate w-full">
                        {iconName}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl h-full min-h-[200px]">
                    <span className="text-xl font-medium mb-2 text-gray-900 dark:text-white">No icons found</span>
                    <span className="text-sm">Try searching for something else</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
