import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { emailService } from '@/services/emailService';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

/**
 * Email Verification Handler Component
 * Handles email verification callback and sends welcome email
 * This page is loaded after user clicks verification link in their email
 */
export default function EmailVerificationHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the token from URL
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (!token_hash || type !== 'email') {
          setStatus('error');
          setMessage('Invalid verification link. Please try again or request a new verification email.');
          return;
        }

        // Verify the email using Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email',
        });

        if (error) {
          console.error('Email verification error:', error);
          setStatus('error');
          setMessage(error.message || 'Email verification failed. The link may have expired.');
          return;
        }

        if (data.user) {
          console.log('✅ Email verified successfully for:', data.user.email);

          // Get user profile to get first name
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', data.user.id)
            .single();

          // Send welcome email asynchronously (non-blocking)
          if (data.user.email) {
            emailService.sendWelcomeEmailAsync({
              email: data.user.email,
              firstName: profile?.first_name || 'Valued Customer'
            });
          }

          setStatus('success');
          setMessage('Your email has been verified successfully! Welcome to Vanguard Cargo.');

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                from: '/email-verified',
                message: 'Email verified! Please log in to continue.' 
              } 
            });
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Verification completed but no user data found. Please try logging in.');
        }

      } catch (err: any) {
        console.error('Unexpected error during email verification:', err);
        setStatus('error');
        setMessage(err?.message || 'An unexpected error occurred. Please try again.');
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Success message with mail icon */}
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-green-800 font-medium">Check your inbox!</p>
                  <p className="text-sm text-green-700 mt-1">
                    We've sent you a welcome email with your account details and instructions on how to get started.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {status === 'success' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Redirecting to login in 3 seconds...</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Continue to Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Register Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
