import React from 'react';
import { motion } from 'framer-motion';
// ...existing code...
// ...existing code...

interface RegisterSuccessStepProps {
  email: string;
  userName: string;
  onGoToLogin: () => void;
}

export const RegisterSuccessStep: React.FC<RegisterSuccessStepProps> = ({ 
  email, 
  userName, 
  onGoToLogin 
}) => {
  // ...existing code...
  return (
        <motion.div 
          key="register-success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-green-700">Account Created!</h2>
          <p className="mb-2 text-lg">
            Hi <b>{userName}</b>, your account has been created.
          </p>
          <p className="mb-4 text-base text-gray-700">
            <b>Next step:</b> Please check your email (<span className="text-black font-semibold">{email}</span>) and click the verification link to activate your account.<br/>
            <span className="text-red-600 font-medium">You must verify your email before you can log in.</span>
          </p>
          <button
            className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
            onClick={onGoToLogin}
          >
            Go to Login
          </button>
        </motion.div>
  );
};
