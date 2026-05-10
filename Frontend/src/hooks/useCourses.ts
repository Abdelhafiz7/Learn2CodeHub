import { useEffect, useCallback } from 'react';
import { coursesApi } from '@/api';
import { useCourseStore } from '@/store';
import { getErrorMessage } from '@/utils';
import toast from 'react-hot-toast';

export function useCourses() {
  const { courses, totalCourses, filters, isLoading, error, setCourses, setLoading, setError } =
    useCourseStore();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await coursesApi.getCourses(filters);
      setCourses(response.data, response.total);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [filters, setCourses, setLoading, setError]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    totalCourses,
    filters,
    isLoading,
    error,
    refetch: fetchCourses,
  };
}
