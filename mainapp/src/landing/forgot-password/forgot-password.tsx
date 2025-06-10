import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff,
  ArrowLeft,
  Mail,
  Key,
  LockKeyhole,
  CheckCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import AnimateInView from '../../components/ui/animate-in-view';
import loginbg from '../../images/register-bg.jpg';
import Image from '../../images/forgot.jpg';
/**
 * ForgotPassword component - Displays the multi-step forgot password flow
 * @returns {JSX.Element} The ForgotPassword page component
 */
export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // Form data
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI state
  const [step, setStep] = useState(1); // 1: Email, 2: Verification Code, 3: New Password, 4: Success
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Email validation
  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const isPasswordValid = (password: string) => {
    return password.length >= 8;
  };

  // Verification code validation
  const isVerificationCodeValid = (code: string) => {
    return code.length === 5 && /^[0-9]+$/.test(code);
  };

  // Handle email submission
  const handleEmailSubmit = async () => {
    if (!isEmailValid(email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setFormError("");

    // Simulate API call to request password reset
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success response
      setFormSuccess("A verification code has been sent to your email");
      setTimeout(() => {
        setStep(2);
        setIsLoading(false);
        setFormSuccess("");
      }, 1500);
    } catch {
      setFormError("Failed to send verification code. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerificationSubmit = async () => {
    if (!isVerificationCodeValid(verificationCode)) {
      setFormError("Please enter a valid 5-digit verification code");
      return;
    }

    setIsLoading(true);
    setFormError("");

    // Simulate API call to verify code
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success response
      setFormSuccess("Verification successful");
      setTimeout(() => {
        setStep(3);
        setIsLoading(false);
        setFormSuccess("");
      }, 1500);
    } catch {
      setFormError("Invalid verification code. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle new password submission
  const handleNewPasswordSubmit = async () => {
    if (!isPasswordValid(newPassword)) {
      setFormError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setFormError("");

    // Simulate API call to reset password
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success response
      setFormSuccess("Your password has been successfully reset");
      setTimeout(() => {
        setStep(4);
        setIsLoading(false);
      }, 1500);
    } catch {
      setFormError("Failed to reset password. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle final redirect to login
  const handleGoToLogin = () => {
    navigate("/login");
  };

  // Handle verification code input
  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow only numbers and limit to 5 digits
    const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 5);
    setVerificationCode(sanitizedValue);
  };

  // UI helpers
  const getStepTitle = () => {
    switch (step) {
      case 1: return "Reset Your Password";
      case 2: return "Verify Your Email";
      case 3: return "Create New Password";
      case 4: return "Password Reset Complete";
      default: return "Reset Your Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "Enter your email address to receive a verification code";
      case 2: return "Enter the 5-digit code sent to your email";
      case 3: return "Create a new secure password for your account";
      case 4: return "Your password has been successfully reset";
      default: return "Follow the steps to reset your password";
    }
  };

  // Helper function to render form error/success message
  const renderMessage = () => {
    if (formError) {
      return (
        <div className="flex items-center gap-2 mt-1">
          <div className="h-4 w-4 flex-shrink-0 text-red-600">!</div>
          <p className="text-sm font-medium text-red-600">{formError}</p>
        </div>
      );
    }
    
    if (formSuccess) {
      return (
        <div className="flex items-center gap-2 mt-1">
          <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-600">{formSuccess}</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="forgot-password-container">
      {/* Main Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${loginbg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <AnimateInView variant="fadeInUp" delay={0.2}>
          <motion.div 
            className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
          >
            {/* Left Side - Image */}
            <AnimateInView variant="fadeInLeft" delay={0.4} className="md:w-1/2">
              <motion.div 
                className="relative h-64 md:h-full min-h-[500px] flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src={Image}
                  alt="Delivery person with logistics background"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimateInView>

            {/* Right Side - Form Content */}
            <AnimateInView variant="fadeInRight" delay={0.6} className="md:w-1/2">
              <div className="p-8 md:p-12 h-full flex flex-col justify-center">
                {/* Step Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
                  <p className="text-gray-600">{getStepDescription()}</p>
                </div>

                {/* Step 1: Email Input Form */}
                {step === 1 && (
                  <AnimateInView variant="fadeIn">
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                          />
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        {renderMessage()}
                      </motion.div>

                      {/* Submit Button */}
                      <motion.button
                        onClick={handleEmailSubmit}
                        disabled={!email || isLoading}
                        className={cn(
                          "w-full font-semibold px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center",
                          email && !isLoading
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                        whileHover={email && !isLoading ? { scale: 1.02, y: -2 } : {}}
                        whileTap={email && !isLoading ? { scale: 0.98 } : {}}
                      >
                        {isLoading ? (
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
                  </AnimateInView>
                )}

                {/* Step 2: Verification Code Form */}
                {step === 2 && (
                  <AnimateInView variant="fadeIn">
                    <div className="space-y-6">
                      {/* Email Display */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Code sent to <span className="font-medium">{email}</span></p>
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
                            value={verificationCode}
                            onChange={handleVerificationCodeChange}
                            placeholder="Enter 5-digit code"
                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                          />
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        {renderMessage()}
                      </motion.div>

                      {/* Submit Button */}
                      <motion.button
                        onClick={handleVerificationSubmit}
                        disabled={!isVerificationCodeValid(verificationCode) || isLoading}
                        className={cn(
                          "w-full font-semibold px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center",
                          isVerificationCodeValid(verificationCode) && !isLoading
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                        whileHover={isVerificationCodeValid(verificationCode) && !isLoading ? { scale: 1.02, y: -2 } : {}}
                        whileTap={isVerificationCodeValid(verificationCode) && !isLoading ? { scale: 0.98 } : {}}
                      >
                        {isLoading ? (
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
                          onClick={() => {
                            setStep(1);
                            setVerificationCode("");
                            setFormError("");
                            setFormSuccess("");
                          }}
                          className="text-sm text-red-500 hover:text-red-600 font-medium"
                        >
                          Resend code
                        </button>
                      </div>
                    </div>
                  </AnimateInView>
                )}

                {/* Step 3: New Password Form */}
                {step === 3 && (
                  <AnimateInView variant="fadeIn">
                    <div className="space-y-6">
                      {/* New Password Field */}
                      <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 pl-10 pr-12 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                          />
                          <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <button
                            className="absolute right-4 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                            type="button"
                          >
                            {showPassword ? (
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
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 pl-10 pr-12 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                          />
                          <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <button
                            className="absolute right-4 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            type="button"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                        {renderMessage()}
                      </motion.div>

                      {/* Submit Button */}
                      <motion.button
                        onClick={handleNewPasswordSubmit}
                        disabled={!newPassword || !confirmPassword || isLoading}
                        className={cn(
                          "w-full font-semibold px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center",
                          newPassword && confirmPassword && !isLoading
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                        whileHover={newPassword && confirmPassword && !isLoading ? { scale: 1.02, y: -2 } : {}}
                        whileTap={newPassword && confirmPassword && !isLoading ? { scale: 0.98 } : {}}
                      >
                        {isLoading ? (
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
                  </AnimateInView>
                )}

                {/* Step 4: Success Message */}
                {step === 4 && (
                  <AnimateInView variant="fadeIn">
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
                        onClick={handleGoToLogin}
                        className="w-full font-semibold px-6 py-3 rounded-md transition-all duration-200 bg-red-500 hover:bg-red-600 text-white"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Go to Login
                      </motion.button>
                    </div>
                  </AnimateInView>
                )}
              </div>
            </AnimateInView>
          </motion.div>
        </AnimateInView>
      </section>
    </div>
  );
}