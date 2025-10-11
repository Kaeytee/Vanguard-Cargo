// ============================================================================
// Error Alert Component
// ============================================================================
// Description: User-friendly error display component
// Author: Senior Software Engineer
// Purpose: Show errors in a visually appealing toast/alert
// Features: Auto-dismiss, severity colors, action buttons, animations
// ============================================================================

import React, { useEffect, useState } from 'react';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle, RefreshCw } from 'lucide-react';
import { AppError, ErrorSeverity, isAppError } from '@/utils/errors/CustomErrors';

/**
 * Alert Type
 */
export type AlertType = 'error' | 'warning' | 'info' | 'success';

/**
 * Error Alert Props
 */
export interface ErrorAlertProps {
  /** Error to display */
  error?: Error | AppError | string;
  
  /** Alert type (overrides error severity) */
  type?: AlertType;
  
  /** Custom title */
  title?: string;
  
  /** Custom message */
  message?: string;
  
  /** Whether alert is visible */
  visible?: boolean;
  
  /** Auto-dismiss after milliseconds (0 = no auto-dismiss) */
  autoDismiss?: number;
  
  /** Callback when dismissed */
  onDismiss?: () => void;
  
  /** Retry action */
  onRetry?: () => void;
  
  /** Retry button text */
  retryText?: string;
  
  /** Show close button */
  showClose?: boolean;
  
  /** Position on screen */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  
  /** Custom className */
  className?: string;
}

/**
 * ErrorAlert Component
 * 
 * Displays errors in a user-friendly toast/alert format.
 * Automatically determines severity and provides recovery actions.
 * 
 * Features:
 * - Auto-dismiss
 * - Severity-based styling
 * - Retry actions
 * - Animations
 * - Accessible
 * 
 * @component
 */
export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  type,
  title,
  message,
  visible = true,
  autoDismiss = 5000,
  onDismiss,
  onRetry,
  retryText = 'Try Again',
  showClose = true,
  position = 'top-right',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [isExiting, setIsExiting] = useState(false);
  
  // Auto-dismiss timer
  useEffect(() => {
    if (!isVisible || !autoDismiss || autoDismiss <= 0) {
      return;
    }
    
    const timer = setTimeout(() => {
      handleDismiss();
    }, autoDismiss);
    
    return () => clearTimeout(timer);
  }, [isVisible, autoDismiss]);
  
  // Update visibility when prop changes
  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);
  
  /**
   * Handle dismiss with animation
   */
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      onDismiss?.();
    }, 300); // Animation duration
  };
  
  /**
   * Determine alert type from error
   */
  const getAlertType = (): AlertType => {
    if (type) return type;
    
    if (isAppError(error)) {
      if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
        return 'error';
      }
      if (error.severity === ErrorSeverity.MEDIUM) {
        return 'warning';
      }
      return 'info';
    }
    
    return 'error';
  };
  
  /**
   * Get alert configuration
   */
  const getAlertConfig = (alertType: AlertType) => {
    const configs = {
      error: {
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        title: 'Error'
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        title: 'Warning'
      },
      info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        title: 'Information'
      },
      success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
        buttonColor: 'bg-green-600 hover:bg-green-700',
        title: 'Success'
      }
    };
    
    return configs[alertType];
  };
  
  /**
   * Get message from error
   */
  const getMessage = (): string => {
    if (message) return message;
    
    if (typeof error === 'string') return error;
    
    if (isAppError(error)) return error.userMessage;
    
    if (error instanceof Error) return error.message;
    
    return 'An error occurred. Please try again.';
  };
  
  /**
   * Get position classes
   */
  const getPositionClasses = (): string => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
    };
    
    return positions[position];
  };
  
  // Don't render if not visible
  if (!isVisible && !isExiting) {
    return null;
  }
  
  const alertType = getAlertType();
  const config = getAlertConfig(alertType);
  const Icon = config.icon;
  const displayTitle = title || config.title;
  const displayMessage = getMessage();
  
  // Show retry button if error is recoverable
  const showRetry = onRetry && (!isAppError(error) || error.recoverable);
  
  return (
    <div
      className={`
        fixed ${getPositionClasses()} z-50
        max-w-md w-full
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
        ${className}
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border rounded-lg shadow-lg p-4
      `}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-sm font-medium mb-1">
              {displayTitle}
            </h3>
            
            {/* Message */}
            <p className="text-sm opacity-90">
              {displayMessage}
            </p>
            
            {/* Recovery hint */}
            {isAppError(error) && error.recoveryHint && (
              <p className="text-xs opacity-75 mt-1">
                💡 {error.recoveryHint}
              </p>
            )}
            
            {/* Actions */}
            {showRetry && (
              <div className="mt-3">
                <button
                  onClick={onRetry}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5
                    text-xs font-medium text-white rounded
                    ${config.buttonColor}
                    transition-colors
                  `}
                >
                  <RefreshCw className="h-3 w-3" />
                  {retryText}
                </button>
              </div>
            )}
          </div>
          
          {/* Close button */}
          {showClose && (
            <button
              onClick={handleDismiss}
              className={`
                flex-shrink-0 ${config.iconColor} opacity-70 hover:opacity-100
                transition-opacity
              `}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * useErrorAlert Hook
 * 
 * Hook for managing error alerts.
 * 
 * @returns {Object} Error alert state and methods
 */
export function useErrorAlert() {
  const [error, setError] = useState<Error | AppError | string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  /**
   * Show error alert
   */
  const showError = (err: Error | AppError | string) => {
    setError(err);
    setIsVisible(true);
  };
  
  /**
   * Hide error alert
   */
  const hideError = () => {
    setIsVisible(false);
    setTimeout(() => setError(null), 300); // Wait for animation
  };
  
  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
    setIsVisible(false);
  };
  
  return {
    error,
    isVisible,
    showError,
    hideError,
    clearError
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default ErrorAlert;
