import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import AnimateInView from '../../components/ui/animate-in-view';
import loginbg from '../../images/register-bg.jpg';
import Image from '../../images/forgot.jpg';

/**
 * EmailVerification component - Professional email verification flow
 * Handles automatic verification through email links only
 */
export default function EmailVerification() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'waiting'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        setStatus('loading');
        
        // First check if user is already verified or has active status
        if (user?.email_confirmed_at || profile?.status === 'active') {
          setStatus('success');
          setMessage('Your email is already verified! Redirecting to your dashboard...');
          setTimeout(() => {
            navigate('/app');
          }, 1500);
          return;
        }

        // Check for Supabase email verification callback
        if (window.location.hash.includes('access_token')) {
          // Supabase handles email verification automatically via the session
          // The user should already be authenticated if they clicked the email link
          if (user?.email_confirmed_at) {
            setStatus('success');
            setMessage('Email verified successfully!');
            
            // Refresh profile to get updated verification status
            await refreshProfile();
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              navigate('/app');
            }, 3000);
          } else {
            setStatus('success');
            setMessage('Email verification in progress...');
            
            // Wait a moment then refresh profile
            setTimeout(async () => {
              await refreshProfile();
              navigate('/app');
            }, 2000);
          }
        } else {
          // No verification token found, show waiting screen
          setStatus('waiting');
          setMessage('Please check your email and click the verification link we sent you.');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Verification failed');
      }
    };

    handleEmailVerification();
  }, [user, profile?.status, navigate, refreshProfile]);

  const handleResendEmail = async () => {
    if (!user?.email) {
      setMessage('No email address found. Please log in again.');
      return;
    }

    setIsResending(true);
    try {
      console.log('User object:', user);
      console.log('Resending verification email for user:', user.email);
      console.log('User email confirmed at:', user?.email_confirmed_at);
      
      const result = await authService.resendEmailVerification(user.email);
      
      if (!result.error) {
        setMessage('Verification email sent! Please check your inbox and spam folder.');
      } else {
        console.error('Resend failed:', result.error);
        setMessage(result.error || 'Failed to resend email. Please try again later.');
        
        // If user is already verified, redirect them
        if (result.error?.includes('already confirmed')) {
          setTimeout(() => {
            navigate('/app');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoBack = () => {
    // Always go back to login since unverified users shouldn't access the app
    navigate('/login');
  };

  return (
    <div className="email-verification-container">
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
                  alt="Delivery person with cargo background"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimateInView>

            {/* Right Side - Form Content */}
            <AnimateInView variant="fadeInRight" delay={0.6} className="md:w-1/2">
              <div className="p-8 md:p-12 h-full flex flex-col justify-center">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verification Required</h2>
                  <p className="text-gray-600">You must verify your email address to access your account and begin shipping</p>
                </div>

          {/* Loading State */}
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-gray-600">Verifying your email...</p>
            </motion.div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h3>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting you to the app...</p>
            </motion.div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h3>
              <p className="text-red-600 mb-6">{message}</p>
              
              <div className="space-y-3">
                {user && (
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isResending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Resend Email</span>
                      </>
                    )}
                  </button>
                )}
                

              </div>
            </motion.div>
          )}

          {/* Waiting for Email Verification */}
          {status === 'waiting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-gray-600 mb-2">
                We sent a verification link to <span className="font-medium text-gray-900">{user?.email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Click the link in your email to verify your account and continue.
              </p>

              {message && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  {message}
                </div>
              )}
              
              <div className="space-y-3">
                {user && (
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isResending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Resend Verification Email</span>
                      </>
                    )}
                  </button>
                )}
                
                {/* Troubleshooting Tips */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Not receiving emails?</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Check your spam/junk folder</li>
                    <li>• Ensure {user?.email} is correct</li>
                    <li>• Wait a few minutes between resend attempts</li>
                    <li>• Try refreshing this page</li>
                  </ul>
                </div>
                
                {/* Note: Skip functionality removed for security - email verification is mandatory */}
              </div>
            </motion.div>
          )}



                {/* Back Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleGoBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </div>
            </AnimateInView>
          </motion.div>
        </AnimateInView>
      </section>
    </div>
  );
}
