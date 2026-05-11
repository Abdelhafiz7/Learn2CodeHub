import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { CourseCard } from '@/components/course';
import { useApi } from '@/hooks';
import { coursesApi } from '@/api';
import { LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/hooks';

export const RecommendedCourses: React.FC = () => {
    const { user } = useAuth();

    const { data: recommendations, isLoading } = useApi(
        () => coursesApi.getRecommendations(),
        []
    );

    if (!user || isLoading && !recommendations?.length) return null;

    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50 transition-colors duration-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Recommended For You
                        </h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Based on your interests and searches
                        </p>
                    </div>
                    <Link
                        to="/courses"
                        className="hidden items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 sm:flex"
                    >
                        View all <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {isLoading ? (
                    <LoadingSpinner text="Loading recommendations..." />
                ) : recommendations && recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {recommendations.slice(0, 8).map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
                        <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400">
                            Search for courses to get personalized recommendations.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};