// Custom hook for API calls with loading states and error handling
import { useState, useCallback } from 'react';
import type { ApiResponse } from '../services/api';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      
      if (result.success) {
        setData(result.data);
        return result.data;
      } else {
        const errorMessage = result.error || 'An error occurred';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

// Specialized hook for paginated data
export function usePaginatedApi<T>() {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<{ items: T[]; totalPages: number; currentPage: number; total: number }>>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      
      if (result.success) {
        setData(result.data.items || []);
        setTotalPages(result.data.totalPages || 0);
        setCurrentPage(result.data.currentPage || 1);
        setTotal(result.data.total || 0);
        return result.data;
      } else {
        const errorMessage = result.error || 'An error occurred';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setLoading(false);
    setTotalPages(0);
    setCurrentPage(1);
    setTotal(0);
  }, []);

  return {
    data,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    execute,
    reset
  };
}
