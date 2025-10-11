// ============================================================================
// Error Boundary Component
// ============================================================================
// Description: React Error Boundary to catch rendering errors
// Author: Senior Software Engineer
// Purpose: Gracefully handle React component errors
// Features: Error catching, logging, fallback UI, error recovery
// ============================================================================

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { errorLogger } from '@/utils/errors/ErrorLogger';
import { UIError, isAppError } from '@/utils/errors/CustomErrors';

/**
 * Error Boundary Props
 */
interface ErrorBoundaryProps {
  /** Child components */
  children: ReactNode;
  
  /** Fallback UI component */
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /** Whether to show detailed error (dev only) */
  showDetails?: boolean;
  
  /** Component name for logging */
  componentName?: string;
}

/**
 * Error Boundary State
 */
interface ErrorBoundaryState {
  /** Whether an error occurred */
  hasError: boolean;
  
  /** The error object */
  error: Error | null;
  
  /** Error info with component stack */
  errorInfo: ErrorInfo | null;
  
  /** Number of error occurrences */
  errorCount: number;
}

/**
 * ErrorBoundary Component
 * 
 * React Error Boundary that catches errors in child components.
 * Displays a fallback UI and logs errors for debugging.
 * 
 * Features:
 * - Catches rendering errors
 * - Logs to error logger
 * - Shows user-friendly fallback UI
 * - Provides error recovery options
 * - Prevents infinite error loops
 * 
 * @class ErrorBoundary
 * @extends Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimer: NodeJS.Timeout | null = null;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }
  
  /**
   * Update state when error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }
  
  /**
   * Log error and call callback
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error info
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // Create UI error
    const uiError = new UIError(
      error.message,
      'A display error occurred. Please try refreshing the page.',
      this.props.componentName || 'Unknown Component',
      {
        component: this.props.componentName,
        componentStack: errorInfo.componentStack,
        errorCount: this.state.errorCount + 1
      }
    );
    
    // Log error
    errorLogger.logError(uiError, {
      originalError: error.toString(),
      componentStack: errorInfo.componentStack
    });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Auto-reset after multiple errors (prevent infinite loop)
    if (this.state.errorCount >= 3) {
      this.scheduleReset();
    }
  }
  
  /**
   * Schedule automatic reset
   */
  private scheduleReset(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
    
    this.resetTimer = setTimeout(() => {
      this.handleReset();
    }, 5000); // Reset after 5 seconds
  }
  
  /**
   * Clean up timer on unmount
   */
  componentWillUnmount(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
  }
  
  /**
   * Reset error boundary
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
  };
  
  /**
   * Refresh page
   */
  handleRefresh = (): void => {
    window.location.reload();
  };
  
  /**
   * Navigate to home
   */
  handleGoHome = (): void => {
    window.location.href = '/';
  };
  
  /**
   * Render fallback UI
   */
  renderFallback(): ReactNode {
    const { error, errorInfo, errorCount } = this.state;
    const { fallback, showDetails } = this.props;
    
    // Custom fallback provided
    if (fallback) {
      if (typeof fallback === 'function') {
        return fallback(error!, errorInfo!);
      }
      return fallback;
    }
    
    // Check if AppError for better message
    const userMessage = isAppError(error)
      ? error.userMessage
      : 'Something went wrong. Please try again.';
    
    // Default fallback UI
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Oops! Something went wrong
          </h1>
          
          {/* User message */}
          <p className="text-gray-600 text-center mb-6">
            {userMessage}
          </p>
          
          {/* Error count warning */}
          {errorCount >= 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800">
                This error has occurred {errorCount} times. The page will reset automatically in a few seconds.
              </p>
            </div>
          )}
          
          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            
            <button
              onClick={this.handleRefresh}
              className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </button>
            
            <button
              onClick={this.handleGoHome}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Home className="h-4 w-4" />
              Go to Home
            </button>
          </div>
          
          {/* Contact support */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              If this problem persists, please{' '}
              <a
                href="mailto:support@vanguardcargo.co"
                className="text-red-600 hover:text-red-700 inline-flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                contact support
              </a>
            </p>
          </div>
          
          {/* Error details (dev only) */}
          {(showDetails || import.meta.env.DEV) && error && (
            <details className="mt-4">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs font-mono text-gray-600 mb-2">
                  <strong>Error:</strong> {error.toString()}
                </p>
                {error.stack && (
                  <pre className="text-xs font-mono text-gray-500 overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                )}
                {errorInfo && (
                  <pre className="text-xs font-mono text-gray-500 overflow-auto max-h-40 mt-2">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }
  
  /**
   * Render component
   */
  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderFallback();
    }
    
    return this.props.children;
  }
}

/**
 * withErrorBoundary HOC
 * 
 * Wraps a component with an error boundary.
 * 
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Partial<ErrorBoundaryProps>} errorBoundaryProps - Error boundary props
 * @returns {React.ComponentType} Wrapped component
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
}

// ============================================================================
// EXPORT
// ============================================================================

export default ErrorBoundary;
