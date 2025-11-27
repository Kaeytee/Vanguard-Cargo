import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useGoogleAuth = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const signInWithGoogle = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const callbackUrl = `${window.location.origin}/auth/callback`;
			console.log('🔐 Initiating Google OAuth with callback:', callbackUrl);

			const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: callbackUrl,
					queryParams: {
						access_type: 'offline',
						prompt: 'consent',
					},
				},
			});

			if (oauthError) {
				console.error('❌ Google sign-in error:', oauthError);
				setError('Failed to sign in with Google. Please try again.');
				setIsLoading(false);
				return;
			}

			console.log('✅ Google OAuth initiated:', data);
		} catch (err) {
			console.error('❌ Unexpected error during Google sign-in:', err);
			setError('An unexpected error occurred. Please try again.');
			setIsLoading(false);
		}
	};

	return { signInWithGoogle, isLoading, error };
};
