import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/lib/api';

// Generic API hook for handling loading states, data, and errors
export function useApi<T>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = [],
  immediate = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    setData
  };
}

// Hook for managing form submissions
export function useApiMutation<T, P = any>(
  apiFunction: (params: P) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(async (params: P) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(params);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset
  };
}

// Hook for managing paginated data
export function usePaginatedApi<T>(
  apiFunction: (page: number, limit: number, filters?: any) => Promise<{ data: T[]; total: number; page: number; limit: number }>,
  initialLimit = 10,
  filters?: any
) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(page, limit, filters);
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, page, limit, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nextPage = useCallback(() => {
    if (page * limit < total) {
      setPage(p => p + 1);
    }
  }, [page, limit, total]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  }, [total, limit]);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    refetch,
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1
  };
}

// Hook for managing cached data with auto-refresh
export function useCachedApi<T>(
  key: string,
  apiFunction: () => Promise<T>,
  refreshInterval?: number,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(() => {
    // Try to get cached data from localStorage
    const cached = localStorage.getItem(`api_cache_${key}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Check if cache is still valid (24 hours by default)
        const now = Date.now();
        if (now - parsed.timestamp < (refreshInterval || 24 * 60 * 60 * 1000)) {
          return parsed.data;
        }
      } catch (e) {
        // Invalid cache, ignore
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
      
      // Cache the result
      localStorage.setItem(`api_cache_${key}`, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));
      
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [key, apiFunction, ...dependencies]);

  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, [data, fetchData]);

  // Auto-refresh if interval is provided
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(`api_cache_${key}`);
    setData(null);
  }, [key]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  initialData: T[],
  apiFunction: (item: T) => Promise<T>
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const optimisticUpdate = useCallback(async (item: T, optimisticUpdate: (items: T[]) => T[]) => {
    // Apply optimistic update immediately
    setData(optimisticUpdate);
    
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(item);
      
      // Update with real result
      setData(current => current.map(i => 
        // Assuming items have an 'id' property
        (i as any).id === (result as any).id ? result : i
      ));
      
      return result;
    } catch (err) {
      // Revert optimistic update
      setData(initialData);
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [initialData, apiFunction]);

  return {
    data,
    loading,
    error,
    optimisticUpdate,
    setData
  };
}

// Hook for infinite scrolling/loading
export function useInfiniteApi<T>(
  apiFunction: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean }>,
  limit = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(page, limit);
      
      setData(current => page === 1 ? result.data : [...current, ...result.data]);
      setHasMore(result.hasMore);
      setPage(p => p + 1);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, page, limit, loading, hasMore]);

  const refresh = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  useEffect(() => {
    if (data.length === 0 && hasMore) {
      loadMore();
    }
  }, [data.length, hasMore, loadMore]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}








