import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

/**
 * ResendVerification component - Standalone page for resending verification emails
 */
export default function ResendVerification() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Redirect active users away from this page
  useEffect(() => {
    if (user && profile?.status === 'active') {
      navigate('/app', { replace: true });
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    setSuccess(false);

    try {
      const result = await authService.resendEmailVerification(email);
      
      if (result.error) {
        setError(result.error.message || 'Failed to send verification email');
      } else {
        setSuccess(true);
        setMessage('Verification email sent successfully! Please check your inbox and spam folder.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setError('Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Resend Verification Email
            </h1>
            <p className="text-gray-600">
              Enter your email address to receive a new verification link
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Sent!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Didn't receive the email? Check your spam folder or try again in a few minutes.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                {isLoading ? 'Sending...' : 'Send Verification Email'}
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? <Link to="/contact" className="text-blue-600 hover:text-blue-700">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
