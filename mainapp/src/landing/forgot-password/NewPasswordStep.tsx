import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { StepProps } from './types';
import { validationUtils } from './utils';
import { authService } from '../../services/authService';
import { MessageDisplay } from './MessageDisplay';

export const NewPasswordStep: React.FC<StepProps> = ({ state, setState, onNext }) => {
  const handleNewPasswordSubmit = async () => {
    if (!validationUtils.isPasswordValid(state.newPassword)) {
      setState(prev => ({ ...prev, formError: "Password must be at least 8 characters long" }));
      return;
    }

    if (state.newPassword !== state.confirmPassword) {
      setState(prev => ({ ...prev, formError: "Passwords do not match" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, formError: "" }));

    try {
      const { error } = await authService.updatePassword(state.newPassword);
      
      if (!error) {
        setState(prev => ({ 
          ...prev, 
          formSuccess: "Password updated successfully! Redirecting to login..." 
        }));
        setTimeout(() => {
          onNext();
          setState(prev => ({ ...prev, isLoading: false, formError: "" }));
        }, 1500);
      } else {
        setState(prev => ({ 
          ...prev, 
          formError: error.message || "Failed to reset password. Please try again.",
          isLoading: false 
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password. Please try again.";
      setState(prev => ({ ...prev, formError: errorMessage, isLoading: false }));
    }
  };

  return (
    <motion.div 
      key="step3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {/* New Password Field */}
        <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password *
          </label>
          <div className="relative">
            <input
              type={state.showPassword ? "text" : "password"}
              id="newPassword"
              value={state.newPassword}
              onChange={(e) => setState(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-4 py-3 pl-10 pr-12 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
            />
            <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
              onClick={() => setState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              type="button"
              aria-label="Toggle password visibility"
            >
              {state.showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
        </motion.div>

        {/* Confirm Password Field */}
        <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type={state.showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={state.confirmPassword}
              onChange={(e) => setState(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-4 py-3 pl-10 pr-12 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
            />
            <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
              onClick={() => setState(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
              type="button"
              aria-label="Toggle confirm password visibility"
            >
              {state.showConfirmPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          <MessageDisplay error={state.formError} success={state.formSuccess} />
        </motion.div>

        {/* Submit Button */}
        <motion.button
          onClick={handleNewPasswordSubmit}
          disabled={!state.newPassword || !state.confirmPassword || state.isLoading}
          className={cn(
            "w-full font-semibold px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center",
            state.newPassword && state.confirmPassword && !state.isLoading
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
          whileHover={state.newPassword && state.confirmPassword && !state.isLoading ? { scale: 1.02, y: -2 } : {}}
          whileTap={state.newPassword && state.confirmPassword && !state.isLoading ? { scale: 0.98 } : {}}
        >
          {state.isLoading ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
