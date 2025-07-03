import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthProvider';

/**
 * EmailVerification component - Handles email verification flow
 * Can be used for both automatic verification (with token from email link)
 * and manual verification (user enters token)
 */
export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'manual'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Get token from URL params or show manual entry
  const tokenFromUrl = searchParams.get('token');

  useEffect(() => {
    const verifyEmailWithToken = async (token: string) => {
      try {
        setStatus('loading');
        const response = await apiService.verifyEmail(token);
        
        if (response.success) {
          setStatus('success');
          setMessage(response.data.message);
          
          // Update user in context if they're logged in
          if (user) {
            const updatedUser = {
              ...user,
              emailVerified: true,
              accountStatus: 'ACTIVE' as const
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate(user ? '/app' : '/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Verification failed');
      }
    };

    if (tokenFromUrl) {
      // Automatic verification from email link
      verifyEmailWithToken(tokenFromUrl);
    } else {
      // Show manual token entry
      setStatus('manual');
    }
  }, [tokenFromUrl, user, setUser, navigate]);

  const handleManualVerification = async () => {
    if (!manualToken.trim()) {
      setMessage('Please enter the verification token');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await apiService.verifyEmail(manualToken);
      
      if (response.success) {
        setStatus('success');
        setMessage(response.data.message);
        
        // Update user in context if they're logged in
        if (user) {
          const updatedUser = {
            ...user,
            emailVerified: true,
            accountStatus: 'ACTIVE' as const
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate(user ? '/app' : '/login');
        }, 3000);
      } else {
        setMessage(response.error || 'Invalid verification token');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email) {
      setMessage('No email address found. Please log in again.');
      return;
    }

    setIsResending(true);
    try {
      const response = await apiService.resendVerificationEmail(user.email);
      
      if (response.success) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(response.error || 'Failed to resend email');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoBack = () => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verification</h1>
            <p className="text-gray-600">Verify your email to activate your account</p>
          </div>

          {/* Loading State */}
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
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
                
                <button
                  onClick={() => setStatus('manual')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Enter Token Manually
                </button>
              </div>
            </motion.div>
          )}

          {/* Manual Token Entry */}
          {status === 'manual' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Check Your Email</p>
                    <p className="text-sm text-blue-700 mt-1">
                      We sent a verification link to <span className="font-medium">{user?.email}</span>. 
                      Click the link or enter the token below.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Token
                  </label>
                  <input
                    type="text"
                    id="token"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Enter verification token"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  />
                </div>

                {message && (
                  <div className="text-red-600 text-sm">{message}</div>
                )}

                <button
                  onClick={handleManualVerification}
                  disabled={isVerifying || !manualToken.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify Email</span>
                  )}
                </button>

                {user && (
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isResending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
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

          {/* Back Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to {user ? 'Dashboard' : 'Login'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
