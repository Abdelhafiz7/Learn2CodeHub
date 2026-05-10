import React from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, BookOpen, Compass, Clock, ArrowRight } from "lucide-react";
import { Button, LoadingSpinner, EmptyState } from "@/components/ui";
import { useApi } from "@/hooks";
import toast from "react-hot-toast";
import { wishlistApi } from "@/api/wishlistApi";
import { formatDuration } from "@/utils";

type WishlistItem = {
    courseId: number;
    course: {
        title: string;
        thumbnailUrl?: string;
        totalDuration?: number;
    };
};

export const MyListPage: React.FC = () => {
    const [removingId, setRemovingId] = React.useState<number | null>(null);
    const {
        data: list,
        isLoading,
        refetch,
    } = useApi<WishlistItem[]>(() => wishlistApi.getMyList(), []);

    const handleRemove = async (courseId: number) => {
        try {
            setRemovingId(courseId);
            await wishlistApi.remove(courseId);
            toast.success("Removed from your list");
            refetch();
        } catch {
            toast.error("Failed to remove");
        } finally {
            setRemovingId(null);
        }
    };

    if (isLoading) {
        return <LoadingSpinner fullPage text="Loading your list..." />;
    }

    if (!list || list.length === 0) {
        return (
            <div className="flex flex-col gap-8 w-full p-4 md:p-6 lg:p-8">
                <EmptyState
                    title="Your list is empty"
                    description="Save courses to access them later"
                    action={
                        <Link to="/courses">
                            <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                                <Compass className="w-4 h-4 mr-2" /> Browse Catalog
                            </Button>
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full p-4 md:p-6 lg:p-8">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-sm">
                        <Heart className="w-7 h-7" fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            My List
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            You have saved {list.length ?? 0} courses for later.
                        </p>
                    </div>
                </div>

                <Link to="/courses" className="shrink-0">
                    <button className="flex items-center justify-center w-full md:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl px-6 py-3 transition-transform hover:scale-105 active:scale-95 font-semibold">
                        <Compass className="w-5 h-5" />
                        Find More Courses
                    </button>
                </Link>
            </div>

            {/* LIST GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {list.map((item) => (
                    <div
                        key={item.courseId}
                        className="group relative bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                    >
                        {/* Thumbnail Header */}
                        <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                            {item.course.thumbnailUrl ? (
                                <img
                                    src={item.course.thumbnailUrl}
                                    alt={item.course.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-600">
                                    <BookOpen className="h-12 w-12 opacity-50" />
                                </div>
                            )}

                            {/* Remove Button (Top Right) */}
                            <div className="absolute top-4 right-4 z-30">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleRemove(item.courseId);
                                    }}
                                    disabled={removingId === item.courseId}
                                    className="w-10 h-10 rounded-xl bg-white/90 dark:bg-black/50 backdrop-blur-md flex items-center justify-center text-rose-500 hover:text-white hover:bg-rose-500 transition-all shadow-lg hover:scale-110 active:scale-95"
                                    title="Remove from list"
                                >
                                    {removingId === item.courseId ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none">
                                <div className="w-14 h-14 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-2xl transform-gpu scale-75 group-hover:scale-100 transition-transform duration-500">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 relative z-10 bg-white dark:bg-[#1C1F26] flex-1 flex flex-col">
                            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                {item.course.title}
                            </h3>
                            
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                </div>
                                {item.course.totalDuration && item.course.totalDuration > 0 
                                    ? formatDuration(item.course.totalDuration) 
                                    : 'Duration not set'}
                            </p>

                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Link to={`/courses/${item.courseId}`} className="block">
                                    <Button className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 border-none shadow-none font-semibold flex items-center justify-center gap-2">
                                        View Details <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};