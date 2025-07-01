import React from 'react';
import { motion } from 'framer-motion';
import { Key } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { StepProps } from './types';
import { validationUtils } from './utils';
import { apiService } from '../../services/api';
import { MessageDisplay } from './MessageDisplay';

export const VerificationStep: React.FC<StepProps> = ({ state, setState, onNext }) => {
  const handleVerificationSubmit = async () => {
    if (!validationUtils.isVerificationCodeValid(state.verificationCode)) {
      setState(prev => ({ ...prev, formError: "Please enter a valid 5-digit verification code" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, formError: "" }));

    try {
      const response = await apiService.verifyResetCode(state.email, state.verificationCode);
      
      if (response.success && response.data) {
        setState(prev => ({ ...prev, formSuccess: response.data.message }));
        setTimeout(() => {
          onNext();
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            formSuccess: "", 
            formError: "" 
          }));
        }, 500);
      } else {
        setState(prev => ({ 
          ...prev, 
          formError: response.error || "Invalid verification code. Please try again.",
          isLoading: false 
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid verification code. Please try again.";
      setState(prev => ({ ...prev, formError: errorMessage, isLoading: false }));
    }
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow only numbers and limit to 5 digits
    const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 5);
    setState(prev => ({ ...prev, verificationCode: sanitizedValue }));
  };

  const handleResendCode = async () => {
    setState(prev => ({ ...prev, isLoading: true, formError: "", formSuccess: "" }));
    
    try {
      const response = await apiService.forgotPassword(state.email);
      if (response.success && response.data) {
        setState(prev => ({ ...prev, formSuccess: "Verification code sent" }));
        setTimeout(() => {
          setState(prev => ({ ...prev, formSuccess: "", isLoading: false, formError: "" }));
        }, 1000);
      }
    } catch {
      setState(prev => ({ ...prev, formError: "Failed to resend code", isLoading: false }));
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
      <div className="space-y-6">
        {/* Email Display */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">Code sent to <span className="font-medium">{state.email}</span></p>
        </div>

        {/* Verification Code Field */}
        <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code *
          </label>
          <div className="relative">
            <input
              type="text"
              id="verificationCode"
              aria-label="Verification Code"
              value={state.verificationCode}
              onChange={handleVerificationCodeChange}
              placeholder="Enter 5-digit code"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
            />
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <MessageDisplay error={state.formError} success={state.formSuccess} />
        </motion.div>

        {/* Submit Button */}
        <motion.button
          onClick={handleVerificationSubmit}
          disabled={state.isLoading}
          className={cn(
            "w-full font-semibold px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center",
            validationUtils.isVerificationCodeValid(state.verificationCode) && !state.isLoading
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
          whileHover={validationUtils.isVerificationCodeValid(state.verificationCode) && !state.isLoading ? { scale: 1.02, y: -2 } : {}}
          whileTap={validationUtils.isVerificationCodeValid(state.verificationCode) && !state.isLoading ? { scale: 0.98 } : {}}
        >
          {state.isLoading ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </motion.button>

        {/* Resend Code */}
        <div className="text-center">
          <button
            onClick={handleResendCode}
            disabled={state.isLoading}
            className="text-sm text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
          >
            Resend code
          </button>
        </div>
      </div>
    </motion.div>
  );
};
