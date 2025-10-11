// ============================================================================
// Error Handling - Index
// ============================================================================
// Description: Central export for all error handling utilities
// Author: Senior Software Engineer
// Purpose: Simplify imports and provide unified error handling interface
// ============================================================================

// Custom Error Classes
export {
  AppError,
  AuthError,
  NetworkError,
  APIError,
  ValidationError,
  DatabaseError,
  BusinessError,
  UIError,
  RateLimitError,
  NotFoundError,
  ErrorSeverity,
  ErrorCategory,
  isAppError,
  getUserMessage,
  toAppError,
  type ErrorMetadata
} from './CustomErrors';

// Error Logger
export {
  ErrorLogger,
  errorLogger,
  LogLevel,
  type ErrorLogEntry,
  type ErrorStatistics,
  type LoggerConfig
} from './ErrorLogger';

// API Error Handler
export {
  APIErrorHandler,
  handleSupabaseQuery,
  createTableErrorHandler,
  type RetryConfig
} from './apiErrorHandler';

// ============================================================================
// QUICK START GUIDE
// ============================================================================

/**
 * USAGE EXAMPLES
 * 
 * 1. BASIC ERROR HANDLING
 * ```typescript
 * import { AppError, errorLogger } from '@/utils/errors';
 * 
 * try {
 *   // Your code
 * } catch (error) {
 *   errorLogger.logError(error);
 *   throw new AppError(
 *     'Technical message',
 *     'User-friendly message'
 *   );
 * }
 * ```
 * 
 * 2. API ERROR HANDLING
 * ```typescript
 * import { handleSupabaseQuery } from '@/utils/errors';
 * 
 * const data = await handleSupabaseQuery(
 *   supabase.from('users').select('*'),
 *   'fetch users',
 *   'users'
 * );
 * ```
 * 
 * 3. COMPONENT ERROR HANDLING
 * ```typescript
 * import { useErrorHandler } from '@/hooks/useErrorHandler';
 * 
 * function MyComponent() {
 *   const { handleError, clearError, hasError, errorMessage } = useErrorHandler({
 *     componentName: 'MyComponent',
 *     autoLog: true
 *   });
 *   
 *   const handleSubmit = async () => {
 *     try {
 *       await someAsyncOperation();
 *     } catch (error) {
 *       handleError(error);
 *     }
 *   };
 *   
 *   if (hasError) {
 *     return <ErrorAlert message={errorMessage} onDismiss={clearError} />;
 *   }
 * }
 * ```
 * 
 * 4. ERROR BOUNDARY
 * ```typescript
 * import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
 * 
 * <ErrorBoundary componentName="MyFeature">
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 * 
 * 5. CUSTOM ERRORS
 * ```typescript
 * import { ValidationError, AuthError } from '@/utils/errors';
 * 
 * // Validation error
 * throw new ValidationError(
 *   'Email is invalid',
 *   'Please enter a valid email address',
 *   'email',
 *   'format'
 * );
 * 
 * // Auth error
 * throw new AuthError(
 *   'Token expired',
 *   'Your session has expired. Please log in again.'
 * );
 * ```
 * 
 * 6. ERROR LOGGING
 * ```typescript
 * import { errorLogger } from '@/utils/errors';
 * 
 * // Log error
 * errorLogger.logError(error, { action: 'submit_form', userId: '123' });
 * 
 * // Log warning
 * errorLogger.logWarning('Low storage space', { available: '10MB' });
 * 
 * // Get statistics
 * const stats = errorLogger.getStatistics();
 * console.log(`Total errors: ${stats.total}`);
 * ```
 * 
 * 7. RETRY LOGIC
 * ```typescript
 * import { APIErrorHandler } from '@/utils/errors';
 * 
 * const data = await APIErrorHandler.withRetry(
 *   () => fetchData(),
 *   {
 *     maxRetries: 3,
 *     retryDelay: 1000,
 *     exponentialBackoff: true
 *   }
 * );
 * ```
 */

// ============================================================================
// CONSOLE DEBUGGING COMMANDS
// ============================================================================

if (typeof window !== 'undefined') {
  // Import locally to avoid scope issues
  import('./ErrorLogger').then(({ errorLogger: logger }) => {
    import('./CustomErrors').then(({ AppError: Error, ErrorCategory: Category, ErrorSeverity: Severity }) => {
      // Make error utilities available globally for debugging
      (window as any).errorUtils = {
        getStats: () => logger.getStatistics(),
        getLogs: () => logger.getLogs(),
        clearLogs: () => logger.clearLogs(),
        testError: () => {
          logger.logError(
            new Error(
              'Test error',
              'This is a test error for debugging',
              Category.UNKNOWN,
              Severity.LOW
            )
          );
          console.log('✅ Test error logged');
        }
      };
      
      console.log('💡 Error utilities available:');
      console.log('  window.errorUtils.getStats() - Get error statistics');
      console.log('  window.errorUtils.getLogs() - Get all error logs');
      console.log('  window.errorUtils.clearLogs() - Clear all logs');
      console.log('  window.errorUtils.testError() - Log a test error');
    });
  });
}
