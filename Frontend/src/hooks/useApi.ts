import { useState, useEffect, useCallback } from 'react';
import { getErrorMessage } from '@/utils';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => void;
}

/**
 * Generic hook for API calls with loading and error state management
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  deps: unknown[] = []
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await apiCall();
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      setState({ data: null, isLoading: false, error: getErrorMessage(err) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}
