import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  return (
    <motion.div 
      key="register-success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center space-y-6"
    >
      {/* Success Icon */}
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

      {/* Success Message */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">Welcome to Ttarius Logistics!</h3>
        <p className="text-gray-600">
          Hi <span className="font-semibold text-gray-900">{userName}</span>, your account has been created successfully.
        </p>
      </div>

      {/* Email Verification Notice */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-start space-x-3">
          <Mail className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-medium text-blue-900">Verification Email Sent</p>
            <p className="text-sm text-blue-700 mt-1">
              We've sent a verification email to <span className="font-medium">{email}</span>. 
              Please check your inbox and verify your email address.
            </p>
          </div>
        </div>
      </motion.div>

      {/* What's Next */}
      <div className="bg-gray-50 rounded-lg p-4 text-left">
        <h4 className="font-semibold text-gray-900 mb-3">What's next?</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Account created ✓</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Verify your email address</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span>Login and start shipping</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <motion.button
          onClick={() => navigate('/verify-email')}
          className="w-full font-semibold px-6 py-3 rounded-lg transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Mail className="h-4 w-4" />
          <span>Verify Email Now</span>
        </motion.button>

        <motion.button
          onClick={onGoToLogin}
          className="w-full font-semibold px-6 py-3 rounded-lg transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Skip for Now</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        <p className="text-xs text-gray-500 text-center">
          You can verify your email later, but some features may be limited until verification.
        </p>
      </div>
    </motion.div>
  );
};
