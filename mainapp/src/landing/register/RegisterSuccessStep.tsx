import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Clock } from 'lucide-react';

/**
 * RegisterSuccessStep Component
 * Displays success message after registration and handles automatic redirect to login
 * @author Senior Software Engineer - Facebook
 */

interface RegisterSuccessStepProps {
  /** User's email address */
  email: string;
  /** User's full name */
  userName: string;
  /** Callback function to navigate to login page */
  onGoToLogin: () => void;
}

/**
 * RegisterSuccessStep functional component
 * @param props - Component properties
 * @returns JSX.Element
 */
export const RegisterSuccessStep: React.FC<RegisterSuccessStepProps> = ({ 
  email, 
  userName, 
  onGoToLogin 
}) => {
  // State for countdown timer
  const [countdown, setCountdown] = useState<number>(5);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  /**
   * Effect hook to handle automatic redirect countdown
   * Redirects user to login page after 5 seconds
   */
  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Clear timer and redirect when countdown reaches 0
          clearInterval(timer);
          setIsRedirecting(true);
          // Add slight delay for smooth transition
          setTimeout(() => {
            onGoToLogin();
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, [onGoToLogin]);

  /**
   * Handle manual navigation to login
   */
  const handleGoToLogin = (): void => {
    setIsRedirecting(true);
    onGoToLogin();
  };

  return (
    <motion.div 
      key="register-success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center space-y-6"
    >
      {/* Success icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
      </div>

      {/* Success heading */}
      <h2 className="text-2xl font-bold mb-4 text-green-700">
        Account Created Successfully!
      </h2>

      {/* Welcome message */}
      <p className="mb-2 text-lg text-gray-800">
        Hi <strong className="text-green-700">{userName}</strong>, welcome to Vanguard Logistics!
      </p>

      {/* Email verification instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center mb-2">
          <Mail className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-sm font-semibold text-blue-800">Email Verification Required</h3>
        </div>
        <p className="text-sm text-blue-700 mb-2">
          We've sent a verification email to:
        </p>
        <p className="text-sm font-semibold text-blue-800 bg-blue-100 px-3 py-1 rounded">
          {email}
        </p>
        <p className="text-xs text-blue-600 mt-2">
          Please check your inbox (and spam folder) and click the verification link to activate your account.
        </p>
      </div>

      {/* Important notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-red-700">
          <strong>Important:</strong> You must verify your email before you can sign in to your account.
        </p>
      </div>

      {/* Auto-redirect notice */}
      {!isRedirecting && countdown > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>Redirecting to login page in {countdown} second{countdown !== 1 ? 's' : ''}...</span>
          </div>
        </div>
      )}

      {/* Redirecting message */}
      {isRedirecting && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center text-sm text-gray-700">
            <span>Redirecting to login page...</span>
          </div>
        </div>
      )}

      {/* Manual navigation button */}
      <button
        className="mt-4 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
        onClick={handleGoToLogin}
        disabled={isRedirecting}
      >
        {isRedirecting ? 'Redirecting...' : 'Go to Login Now'}
      </button>

      {/* Additional help text */}
      <p className="text-xs text-gray-500 mt-4">
        Didn't receive the email? Check your spam folder or contact support if you need assistance.
      </p>
    </motion.div>
  );
};
