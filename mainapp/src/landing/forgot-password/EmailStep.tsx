import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { StepProps } from './types';
import { validationUtils } from './utils';
import { apiService } from '../../services/api';
import { MessageDisplay } from './MessageDisplay';

export const EmailStep: React.FC<StepProps> = ({ state, setState, onNext }) => {
  const handleEmailSubmit = async () => {
    if (!state.email.trim()) {
      setState(prev => ({ ...prev, formError: "Email is required" }));
      return;
    }
    
    if (!validationUtils.isEmailValid(state.email)) {
      setState(prev => ({ ...prev, formError: "Please enter a valid email address" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, formError: "" }));

    try {
      const response = await apiService.forgotPassword(state.email);
      
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
          formError: response.error || "Failed to send verification code. Please try again.",
          isLoading: false 
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send verification code. Please try again.";
      setState(prev => ({ ...prev, formError: errorMessage, isLoading: false }));
    }
  };

  return (
    <motion.div 
      key="step1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {/* Email Field */}
        <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              aria-label="Email Address"
              value={state.email}
              onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
              placeholder="you@example.com"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <MessageDisplay error={state.formError} success={state.formSuccess} />
        </motion.div>

        {/* Submit Button */}
        <motion.button
          onClick={handleEmailSubmit}
          disabled={state.isLoading}
          className={cn(
            "w-full font-semibold px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center",
            !state.isLoading
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
          whileHover={!state.isLoading ? { scale: 1.02, y: -2 } : {}}
          whileTap={!state.isLoading ? { scale: 0.98 } : {}}
        >
          {state.isLoading ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Sending...
            </>
          ) : (
            'Send Verification Code'
          )}
        </motion.button>

        {/* Back to Login Link */}
        <div className="text-center">
          <a 
            href="/login" 
            className="text-sm text-red-500 hover:text-red-600 font-medium inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </a>
        </div>
      </div>
    </motion.div>
  );
};
