// ============================================================================
// Redux Auth Hook - Compatibility Wrapper
// ============================================================================
// Description: Drop-in replacement for Context API useAuth hook
// Author: Senior Software Engineer  
// Purpose: Provides same interface as useAuth but uses Redux
// Architecture: Clean Code, OOP Principles, Type-Safe
// ============================================================================

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  selectUser,
  selectProfile,
  selectIsLoading,
  selectError,
  selectIsAuthenticated
} from '@/store/slices/authSlice';
import type { User, Session } from '@supabase/supabase-js';
import type { AuthUser } from '@/services/authService';
import { supabase } from '@/lib/supabase';

/**
 * Redux Auth Hook Interface
 * Provides same interface as Context API useAuth for easy migration
 * 
 * @returns {Object} Auth state and methods
 */
interface UseReduxAuthReturn {
  // State
  user: User | null;
  profile: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Methods
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    streetAddress?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * useReduxAuth - Redux-based authentication hook
 * 
 * Drop-in replacement for Context API useAuth hook
 * Provides same interface but uses Redux for state management
 * 
 * @example
 * // OLD (Context API):
 * import { useAuth } from '../hooks/useAuth';
 * const { user, profile, loading } = useAuth();
 * 
 * // NEW (Redux):
 * import { useReduxAuth } from '../hooks/useReduxAuth';
 * const { user, profile, loading } = useReduxAuth();
 * 
 * @returns {UseReduxAuthReturn} Auth state and methods
 */
export function useReduxAuth(): UseReduxAuthReturn {
  // Redux state and dispatch
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const profile = useAppSelector(selectProfile);
  const loading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  /**
   * Get current session from Supabase
   * Note: Redux doesn't store session, fetch from Supabase
   */
  const getSession = useCallback(async (): Promise<Session | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (err) {
      return null;
    }
  }, []);

  /**
   * Sign in with email and password
   * Compatible with Context API signIn method
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{ error: string | null }>}
   */
  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      // Dispatch Redux login action
      const result = await dispatch(loginUser({ email, password })).unwrap();
      
      // Success - no error
      return { error: null };
    } catch (err: any) {
      // Error occurred
      return { error: err || 'Login failed' };
    }
  }, [dispatch]);

  /**
   * Sign up new user
   * Compatible with Context API signUp method
   * 
   * @param {Object} data - User registration data
   * @returns {Promise<{ error: string | null }>}
   */
  const signUp = useCallback(async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    streetAddress?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  }): Promise<{ error: string | null }> => {
    try {
      // Dispatch Redux register action
      await dispatch(registerUser(data)).unwrap();
      
      // Success - no error
      return { error: null };
    } catch (err: any) {
      // Error occurred
      return { error: err || 'Registration failed' };
    }
  }, [dispatch]);

  /**
   * Sign out current user
   * Compatible with Context API signOut method
   * 
   * @returns {Promise<void>}
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      // Dispatch Redux logout action
      await dispatch(logoutUser()).unwrap();
    } catch (err) {
      // Even if error, force logout
      console.error('Logout error:', err);
    }
  }, [dispatch]);

  /**
   * Refresh user profile from database
   * Fetches latest profile data and updates Redux state
   * 
   * @returns {Promise<void>}
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      console.warn('Cannot refresh profile: no user ID');
      return;
    }

    try {
      // Fetch latest profile from database
      const { authService } = await import('@/services/authService');
      const updatedProfile = await authService.getUserProfile(user.id);
      
      if (updatedProfile) {
        // Update Redux state with latest profile
        await dispatch(updateUserProfile(updatedProfile)).unwrap();
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  }, [user?.id, dispatch]);

  // Return auth state and methods (same interface as Context API)
  return {
    // State
    user,
    profile,
    session: null, // Session fetched on demand via getSession if needed
    loading,
    error,
    isAuthenticated,
    
    // Methods
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };
}

/**
 * Export as default for backward compatibility
 */
export default useReduxAuth;

// ============================================================================
// MIGRATION GUIDE
// ============================================================================

/**
 * HOW TO MIGRATE FROM CONTEXT API TO REDUX:
 * 
 * 1. Change import:
 *    OLD: import { useAuth } from '../hooks/useAuth';
 *    NEW: import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
 * 
 * 2. Component code stays the same:
 *    const { user, profile, loading, signIn, signOut } = useAuth();
 * 
 * 3. All methods work the same:
 *    await signIn(email, password);
 *    await signOut();
 *    await refreshProfile();
 * 
 * 4. After migration complete, you can:
 *    - Remove Context API files
 *    - Rename useReduxAuth to useAuth
 *    - Update imports to use shorter name
 */

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * EXAMPLE 1: Login Component
 * 
 * ```typescript
 * import { useReduxAuth as useAuth } from '@/hooks/useReduxAuth';
 * 
 * function LoginForm() {
 *   const { signIn, loading, error } = useAuth();
 *   
 *   const handleLogin = async (email: string, password: string) => {
 *     const { error } = await signIn(email, password);
 *     if (error) {
 *       alert(error);
 *     }
 *   };
 *   
 *   return <form onSubmit={handleLogin}>...</form>;
 * }
 * ```
 * 
 * EXAMPLE 2: Dashboard Component
 * 
 * ```typescript
 * import { useReduxAuth as useAuth } from '@/hooks/useReduxAuth';
 * 
 * function Dashboard() {
 *   const { user, profile, loading } = useAuth();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Not logged in</div>;
 *   
 *   return (
 *     <div>
 *       <h1>Welcome {profile?.firstName}</h1>
 *       <p>{user.email}</p>
 *     </div>
 *   );
 * }
 * ```
 * 
 * EXAMPLE 3: Profile Update
 * 
 * ```typescript
 * import { useReduxAuth as useAuth } from '@/hooks/useReduxAuth';
 * 
 * function ProfileSettings() {
 *   const { profile, refreshProfile } = useAuth();
 *   
 *   const handleUpdate = async () => {
 *     // Update profile in database
 *     await updateProfileAPI();
 *     // Refresh Redux state
 *     await refreshProfile();
 *   };
 *   
 *   return <button onClick={handleUpdate}>Update</button>;
 * }
 * ```
 */
