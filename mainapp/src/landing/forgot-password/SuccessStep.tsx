import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import type { StepProps } from './types';

interface SuccessStepProps extends Omit<StepProps, 'onNext'> {
  onGoToLogin: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ onGoToLogin }) => {
  return (
    <motion.div 
      key="step4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-8 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex justify-center"
        >
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
        </motion.div>

        <div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Password Reset Successful!</h3>
          <p className="text-gray-600">Your password has been reset successfully. You can now log in with your new password.</p>
        </div>

        {/* Login Button */}
        <motion.button
          onClick={onGoToLogin}
          className="w-full font-semibold px-6 py-3 rounded-md transition-all duration-200 bg-red-500 hover:bg-red-600 text-white"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Go to Login
        </motion.button>
      </div>
    </motion.div>
  );
};
