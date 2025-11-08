/**
 * AuthCallback Component
 * 
 * Handles the OAuth redirect from Supabase after Google authentication
 * This page is shown briefly while processing the authentication
 * 
 * Flow:
 * 1. User authenticates with Google
 * 2. Google redirects to Supabase
 * 3. Supabase processes and redirects to your Site URL (this page)
 * 4. This component:
 *    - Detects the session in URL hash (#access_token=...)
 *    - Waits for Supabase to process it
 *    - Updates Redux store with user data
 *    - Redirects to dashboard
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppDispatch } from '../store/hooks';
import { initializeAuth } from '../store/slices/authSlice';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is an OAuth callback by looking for hash params
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const hasAuthParams = hashParams.has('access_token') || hashParams.has('error');

        if (!hasAuthParams) {
          console.log('⚠️ No OAuth params found, checking for existing session');
        }

        setStatus('Verifying your credentials...');

        // Small delay to allow Supabase to process the OAuth callback
        // Supabase detectSessionInUrl handles the hash parameters automatically
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get the session - Supabase will have processed the URL hash by now
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          setError('Failed to verify authentication. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!session) {
          console.warn('⚠️ No session found after OAuth callback');
          // Check if there's an error in the URL
          const errorDescription = hashParams.get('error_description');
          if (errorDescription) {
            setError(errorDescription);
          } else {
            setError('No session found. Redirecting to login...');
          }
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        console.log('✅ OAuth session established:', {
          user: session.user.email,
          provider: session.user.app_metadata?.provider,
        });

        setStatus('Loading your profile...');

        // Initialize auth state in Redux
        // This will fetch the user profile and update the store
        const result = await dispatch(initializeAuth()).unwrap();

        if (!result) {
          throw new Error('Failed to initialize user profile');
        }

        setStatus('Success! Redirecting to dashboard...');

        // Small delay to show success message
        await new Promise(resolve => setTimeout(resolve, 800));

        // Redirect to dashboard
        navigate('/dashboard', { replace: true });

      } catch (err) {
        console.error('❌ Auth callback error:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'Authentication failed. Please try again.'
        );
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, dispatch, location.hash]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you back to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {status.includes('Success') ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {status.includes('Success') ? 'Welcome!' : 'Completing Sign In'}
        </h2>
        <p className="text-gray-600 mb-4">
          {status}
        </p>
        {!status.includes('Success') && (
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
