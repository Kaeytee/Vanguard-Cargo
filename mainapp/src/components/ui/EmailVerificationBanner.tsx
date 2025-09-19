import React, { useState } from 'react';
import { Mail, X, RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * EmailVerificationBanner Component
 * Displays a notification banner prompting users to verify their email
 * Includes functionality to resend verification emails
 * @author Senior Software Engineer - Facebook
 */

interface EmailVerificationBannerProps {
  /** The email address that needs verification */
  email: string;
  /** Callback function to handle resending verification email */
  onResendVerification: (email: string) => Promise<{ success: boolean; message: string }>;
  /** Callback function when banner is dismissed */
  onDismiss?: () => void;
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
  /** Custom CSS classes */
  className?: string;
}

/**
 * EmailVerificationBanner functional component
 * @param props - Component properties
 * @returns JSX.Element
 */
export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  email,
  onResendVerification,
  onDismiss,
  dismissible = true,
  className
}) => {
  // Component state management
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  /**
   * Handle resending verification email
   * Manages loading state and user feedback
   */
  const handleResendClick = async (): Promise<void> => {
    // Set loading state
    setIsResending(true);
    setResendStatus('idle');
    setStatusMessage('');

    try {
      // Call the resend function passed from parent
      const result = await onResendVerification(email);
      
      if (result.success) {
        // Success state
        setResendStatus('success');
        setStatusMessage(result.message || 'Verification email sent successfully!');
      } else {
        // Error state
        setResendStatus('error');
        setStatusMessage(result.message || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Error resending verification email:', error);
      setResendStatus('error');
      setStatusMessage('An unexpected error occurred. Please try again.');
    } finally {
      // Clear loading state
      setIsResending(false);
    }
  };

  /**
   * Handle banner dismissal
   */
  const handleDismiss = (): void => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className={cn(
      "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 relative",
      "shadow-sm transition-all duration-200",
      className
    )}>
      {/* Dismiss button */}
      {dismissible && onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-blue-400 hover:text-blue-600 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Main content */}
      <div className="flex items-start space-x-3">
        {/* Mail icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Mail className="w-5 h-5 text-blue-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-blue-800">
              Email Verification Required
            </h3>
          </div>

          {/* Message */}
          <div className="text-sm text-blue-700 mb-3">
            <p className="mb-2">
              Please check your email <strong className="font-medium">{email}</strong> and click the verification link to activate your account.
            </p>
            <p className="text-blue-600">
              <strong>Note:</strong> You must verify your email before you can sign in.
            </p>
          </div>

          {/* Status message */}
          {statusMessage && (
            <div className={cn(
              "text-sm mb-3 p-2 rounded",
              resendStatus === 'success' 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "bg-red-100 text-red-700 border border-red-200"
            )}>
              <div className="flex items-center space-x-2">
                {resendStatus === 'success' && <CheckCircle className="w-4 h-4" />}
                <span>{statusMessage}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Resend button */}
            <button
              onClick={handleResendClick}
              disabled={isResending || resendStatus === 'success'}
              className={cn(
                "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isResending || resendStatus === 'success'
                  ? "bg-blue-300 text-blue-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {/* Loading spinner */}
              {isResending && (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              )}
              
              {/* Success icon */}
              {resendStatus === 'success' && (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              
              {/* Button text */}
              {isResending 
                ? 'Sending...' 
                : resendStatus === 'success' 
                  ? 'Email Sent!' 
                  : 'Resend Verification Email'
              }
            </button>

            {/* Help text */}
            <span className="text-xs text-blue-600">
              Check your spam folder if you don't see the email
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
