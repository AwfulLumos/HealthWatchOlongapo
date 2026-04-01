import { useState, useEffect, useCallback } from 'react';

interface UseLoadingOptions {
  /** Initial loading delay in milliseconds (default: 1000) */
  delay?: number;
  /** Whether to start loading immediately (default: true) */
  immediate?: boolean;
}

/**
 * Hook for managing loading states with simulated delays.
 * Useful for skeleton loading displays before actual data fetching.
 * 
 * When you connect to a backend:
 * 1. Replace the setTimeout with actual API calls
 * 2. Use setLoading(true) before API call and setLoading(false) after
 * 
 * @example
 * // Basic usage with skeleton
 * const { isLoading, startLoading, stopLoading } = useLoading({ delay: 1200 });
 * 
 * if (isLoading) return <DashboardSkeleton />;
 * 
 * @example
 * // With actual API call (future implementation)
 * const { isLoading, setLoading } = useLoading({ immediate: false });
 * 
 * useEffect(() => {
 *   setLoading(true);
 *   fetchData()
 *     .then(setData)
 *     .finally(() => setLoading(false));
 * }, []);
 */
export function useLoading(options: UseLoadingOptions = {}) {
  const { delay = 1000, immediate = true } = options;
  const [isLoading, setIsLoading] = useState(immediate);

  useEffect(() => {
    if (!immediate) return;

    // Simulate loading delay - replace with actual API call when backend is ready
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, immediate]);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    setLoading,
  };
}

/**
 * Hook for managing async data fetching with loading states.
 * Designed for easy migration to real API calls.
 * 
 * @example
 * const { data, isLoading, error, refetch } = useAsyncData(
 *   () => fetchPatients(),
 *   { mockData: mockPatients, mockDelay: 1000 }
 * );
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: {
    /** Mock data to use during development */
    mockData?: T;
    /** Delay before returning mock data (ms) */
    mockDelay?: number;
    /** Whether to use mock data instead of fetcher */
    useMock?: boolean;
  } = {}
) {
  const { mockData, mockDelay = 1000, useMock = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (useMock && mockData !== undefined) {
        // Simulate API delay with mock data
        await new Promise(resolve => setTimeout(resolve, mockDelay));
        setData(mockData);
      } else {
        // Use actual fetcher
        const result = await fetcher();
        setData(result);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, mockData, mockDelay, useMock]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    isLoading,
    error,
    refetch: fetch,
  };
}
