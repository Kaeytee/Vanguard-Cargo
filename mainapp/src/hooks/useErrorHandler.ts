// ============================================================================
// useErrorHandler Hook
// ============================================================================
// Description: React hook for handling errors in components
// Author: Senior Software Engineer
// Purpose: Simplify error handling in React components
// Features: Error state, recovery, retry, user feedback
// ============================================================================

import { useState, useCallback, useRef } from 'react';
import { AppError, toAppError, getUserMessage } from '@/utils/errors/CustomErrors';
import { errorLogger } from '@/utils/errors/ErrorLogger';

/**
 * Error Handler State
 */
export interface ErrorHandlerState {
  /** Current error */
  error: AppError | null;
  
  /** Whether an error exists */
  hasError: boolean;
  
  /** User-friendly error message */
  errorMessage: string | null;
  
  /** Whether error is recoverable */
  isRecoverable: boolean;
  
  /** Recovery hint */
  recoveryHint: string | null;
}

/**
 * Error Handler Options
 */
export interface ErrorHandlerOptions {
  /** Auto-log errors */
  autoLog?: boolean;
  
  /** Component name for logging */
  componentName?: string;
  
  /** Callback when error occurs */
  onError?: (error: AppError) => void;
  
  /** Callback when error is cleared */
  onClear?: () => void;
  
  /** Max retry attempts */
  maxRetries?: number;
}

/**
 * useErrorHandler Hook
 * 
 * Hook for handling errors in React components.
 * Provides error state, recovery mechanisms, and retry logic.
 * 
 * Features:
 * - Error state management
 * - Automatic error logging
 * - Retry with exponential backoff
 * - Error recovery
 * - User-friendly messages
 * 
 * @param {ErrorHandlerOptions} options - Hook options
 * @returns {Object} Error handler methods and state
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    autoLog = true,
    componentName,
    onError,
    onClear,
    maxRetries = 3
  } = options;
  
  // Error state
  const [state, setState] = useState<ErrorHandlerState>({
    error: null,
    hasError: false,
    errorMessage: null,
    isRecoverable: true,
    recoveryHint: null
  });
  
  // Retry state
  const retryCount = useRef(0);
  const retryTimers = useRef<NodeJS.Timeout[]>([]);
  
  /**
   * Handle error
   * 
   * @param {any} error - Error to handle
   * @param {Record<string, any>} context - Additional context
   */
  const handleError = useCallback((error: any, context?: Record<string, any>) => {
    // Convert to AppError
    const appError = toAppError(error, {
      component: componentName,
      ...context
    });
    
    // Update state
    setState({
      error: appError,
      hasError: true,
      errorMessage: getUserMessage(appError),
      isRecoverable: appError.recoverable,
      recoveryHint: appError.recoveryHint || null
    });
    
    // Log error
    if (autoLog) {
      errorLogger.logError(appError, context);
    }
    
    // Call onError callback
    if (onError) {
      onError(appError);
    }
  }, [autoLog, componentName, onError]);
  
  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState({
      error: null,
      hasError: false,
      errorMessage: null,
      isRecoverable: true,
      recoveryHint: null
    });
    
    // Reset retry count
    retryCount.current = 0;
    
    // Clear retry timers
    retryTimers.current.forEach(timer => clearTimeout(timer));
    retryTimers.current = [];
    
    // Call onClear callback
    if (onClear) {
      onClear();
    }
  }, [onClear]);
  
  /**
   * Retry failed operation
   * 
   * @param {Function} operation - Operation to retry
   * @param {number} delay - Delay before retry (ms)
   * @returns {Promise} Operation result
   */
  const retry = useCallback(async <T,>(
    operation: () => Promise<T>,
    delay: number = 1000
  ): Promise<T> => {
    // Check retry limit
    if (retryCount.current >= maxRetries) {
      handleError(
        new AppError(
          'Max retries exceeded',
          'Maximum retry attempts reached. Please try again later.',
          undefined,
          undefined,
          false
        )
      );
      throw state.error;
    }
    
    // Clear current error
    clearError();
    
    // Increment retry count
    retryCount.current++;
    
    // Calculate delay with exponential backoff
    const retryDelay = delay * Math.pow(2, retryCount.current - 1);
    
    // Wait before retry
    await new Promise(resolve => {
      const timer = setTimeout(resolve, retryDelay);
      retryTimers.current.push(timer);
    });
    
    try {
      // Attempt operation
      const result = await operation();
      
      // Success - reset retry count
      retryCount.current = 0;
      
      return result;
    } catch (error) {
      // Failed - handle error
      handleError(error, {
        action: 'retry',
        retryAttempt: retryCount.current,
        maxRetries
      });
      
      throw error;
    }
  }, [maxRetries, handleError, clearError, state.error]);
  
  /**
   * Wrap async function with error handling
   * 
   * @param {Function} fn - Async function to wrap
   * @param {string} action - Action name for logging
   * @returns {Function} Wrapped function
   */
  const wrapAsync = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    action?: string
  ): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    return async (...args: Parameters<T>) => {
      try {
        clearError();
        return await fn(...args);
      } catch (error) {
        handleError(error, {
          action,
          args: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg).substring(0, 100) : String(arg)
          )
        });
        throw error;
      }
    };
  }, [handleError, clearError]);
  
  /**
   * Try-catch wrapper with error handling
   * 
   * @param {Function} fn - Function to execute
   * @param {Function} fallback - Fallback function on error
   * @returns {Promise} Result or fallback result
   */
  const tryCatch = useCallback(async <T,>(
    fn: () => Promise<T>,
    fallback?: (error: AppError) => T | Promise<T>
  ): Promise<T | undefined> => {
    try {
      clearError();
      return await fn();
    } catch (error) {
      handleError(error);
      
      if (fallback && state.error) {
        return await fallback(state.error);
      }
      
      return undefined;
    }
  }, [handleError, clearError, state.error]);
  
  /**
   * Reset error handler
   */
  const reset = useCallback(() => {
    clearError();
    retryCount.current = 0;
    retryTimers.current.forEach(timer => clearTimeout(timer));
    retryTimers.current = [];
  }, [clearError]);
  
  return {
    // State
    ...state,
    
    // Methods
    handleError,
    clearError,
    retry,
    wrapAsync,
    tryCatch,
    reset,
    
    // Retry info
    retryAttempts: retryCount.current,
    canRetry: retryCount.current < maxRetries && state.isRecoverable
  };
}

/**
 * useAsyncError Hook
 * 
 * Simplified hook for async operations with error handling.
 * 
 * @returns {Object} Async error state and execute function
 */
export function useAsyncError() {
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Execute async function with error handling
   */
  const execute = useCallback(async <T,>(
    fn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: AppError) => void
  ): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fn();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const appError = toAppError(err);
      setError(appError);
      errorLogger.logError(appError);
      
      if (onError) {
        onError(appError);
      }
      
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    error,
    isLoading,
    hasError: !!error,
    execute,
    clearError
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default useErrorHandler;
