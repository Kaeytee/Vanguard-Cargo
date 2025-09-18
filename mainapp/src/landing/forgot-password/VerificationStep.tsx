import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock } from 'lucide-react';
import type { StepProps } from './types';
import { authService } from '../../services/authService';
import { MessageDisplay } from './MessageDisplay';

export const VerificationStep: React.FC<StepProps> = ({ state, setState }) => {
  // This step now serves as an informational "Check your email" step
  // Supabase uses email links instead of verification codes

  const handleResendEmail = async () => {
    setState(prev => ({ ...prev, isLoading: true, formError: "", formSuccess: "" }));
    
    try {
      const { error } = await authService.resetPassword(state.email);
      if (!error) {
        setState(prev => ({ 
          ...prev, 
          formSuccess: "Reset link sent again! Please check your email.",
          isLoading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          formError: error.message || "Failed to resend email",
          isLoading: false 
        }));
      }
    } catch {
      setState(prev => ({ 
        ...prev, 
        formError: "Failed to resend email. Please try again.",
        isLoading: false 
      }));
    }
  };

  return (
    <motion.div 
      key="step2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6 text-center">
        {/* Email Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
          <p className="text-gray-600">
            We've sent a password reset link to <span className="font-medium text-gray-900">{state.email}</span>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in the email to reset your password. The link will expire in 24 hours.
          </p>
        </div>

        <MessageDisplay error={state.formError} success={state.formSuccess} />

        {/* Resend Email Button */}
        <div className="pt-4">
          <motion.button
            onClick={handleResendEmail}
            disabled={state.isLoading}
            className="text-red-500 hover:text-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {state.isLoading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full inline-block mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Sending...
              </>
            ) : (
              'Resend email'
            )}
          </motion.button>
        </div>

        {/* Instructions */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            Didn't receive the email? Check your spam folder
          </div>
        </div>
      </div>
    </motion.div>
  );
};
