import { createContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService, type AuthUser } from '../services/authService';
import { PackageNotificationService } from '../services/packageNotificationService';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  profile: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile when user changes
  const loadProfile = useCallback(async (user: User) => {
    const userId = user.id;
    try {
      let userProfile = await authService.getUserProfile(userId);

      // If profile doesn't exist for a logged-in user, create it on the fly.
      // This fixes accounts that were created before the register_user RPC was added to the signup flow.
      if (!userProfile) {
        console.warn(`Profile not found for user ${userId}. Attempting to create it now.`);
        const { error: creationError } = await authService.createUserProfile(user.id, user.email!, user.user_metadata);

        if (creationError) {
          console.error('Failed to auto-create user profile:', creationError);
          setProfile(null);
          return;
        }

        // Re-fetch the profile after creating it
        userProfile = await authService.getUserProfile(userId);
        console.log(`Successfully created and loaded profile for user ${userId}.`);
      }
      
      // If user has pending_verification status but their email is confirmed, auto-activate.
      if (userProfile?.status === 'pending_verification' && user.email_confirmed_at) {
        console.log('Auto-activating user account - email verified through sign-in');
        await authService.updateUserProfile(userId, { status: 'active' });
        // Reload profile with updated status
        const updatedProfile = await authService.getUserProfile(userId);
        setProfile(updatedProfile);
      } else {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const currentSession = await authService.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          await loadProfile(currentSession.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user);
        
        // Refresh notifications and setup real-time for the authenticated user
        const notificationService = PackageNotificationService.getInstance();
        await notificationService.refreshNotificationsForUser(session.user.id);
        notificationService.setupRealtimeForUser(session.user.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      // Removed setLoading(true) to prevent blue loading screen during login
      const { error, user: authUser } = await authService.signIn({ email, password });
      
      if (error) {
        return { error: error.message };
      }
      
      // Clear mock data for real users on successful login
      const { clearMockData } = await import('../utils/clearMockData');
      clearMockData();
      
      // Refresh notifications and setup real-time for the logged in user
      if (authUser?.id) {
        const notificationService = PackageNotificationService.getInstance();
        await notificationService.refreshNotificationsForUser(authUser.id);
        notificationService.setupRealtimeForUser(authUser.id);
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      // Removed setLoading(false) to prevent loading state changes
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<{ error: string | null }> => {
    try {
      // Removed setLoading(true) to prevent blue loading screen during registration
      const { error } = await authService.signUp({
        ...data,
        streetAddress: '', // Will be filled in later during profile setup
        city: '',
        country: '',
        postalCode: ''
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      // Removed setLoading(false) to prevent loading state changes
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Disconnect real-time notifications
      const notificationService = PackageNotificationService.getInstance();
      notificationService.disconnect();
      
      await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (user) {
      await loadProfile(user);
    }
  }, [user, loadProfile]);

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
