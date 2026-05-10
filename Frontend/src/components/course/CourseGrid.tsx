import React from 'react';
import { CourseCard } from './CourseCard';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import type { Course } from '@/types';

interface CourseGridProps {
  courses: Course[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export const CourseGrid: React.FC<CourseGridProps> = ({
  courses,
  isLoading = false,
  emptyTitle = 'No courses found',
  emptyDescription = 'Try adjusting your search or filter criteria.',
  emptyAction,
}) => {
  if (isLoading) {
    return <LoadingSpinner text="Loading courses..." />;
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};
