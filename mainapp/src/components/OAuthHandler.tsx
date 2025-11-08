/**
 * OAuthHandler Component
 * 
 * Detects OAuth callback parameters in URL and redirects to AuthCallback page
 * This allows Supabase to redirect to your Site URL (/) and still handle OAuth properly
 * 
 * Place this component at the root level of your app
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OAuthHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if URL contains OAuth callback parameters
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const hasOAuthParams = 
      hashParams.has('access_token') || 
      hashParams.has('error') ||
      hashParams.has('type'); // Supabase adds type parameter

    if (hasOAuthParams) {
      console.log('🔍 OAuth callback detected on home page, redirecting to /auth/callback');
      // Redirect to callback page while preserving the hash
      navigate(`/auth/callback${location.hash}`, { replace: true });
    }
  }, [location.hash, navigate]);

  return null; // This component doesn't render anything
}
