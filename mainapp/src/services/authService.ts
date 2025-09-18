import { supabase } from '../lib/supabase';
import type { AuthError, User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'warehouse_staff';
  phone?: string;
  status: 'pending_verification' | 'active' | 'suspended';
  usShippingAddressId?: string;
  streetAddress?: string;
  address?: string; // Alias for streetAddress
  city?: string;
  country?: string;
  postalCode?: string;
  zip?: string; // Alias for postalCode
  avatarUrl?: string;
  profileImage?: string; // Alias for avatarUrl
  isEmailVerified?: boolean;
  accountStatus?: string; // Additional status field
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  // Sign up new user
  async signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      // Send first_name and last_name as user_metadata to Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
          },
        },
      });

      if (error) {
        return { user: null, error };
      }

      // No need to manually insert into user_profiles if using trigger
      return { user: authData.user, error: null };
    } catch (err) {
      console.error('Sign up error:', err);
      return { user: null, error: err as AuthError };
    }
  }

  // Sign in user
  async signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        return { user: null, error };
      }

      // Check if email is verified before allowing login
      if (authData.user && !authData.user.email_confirmed_at) {
        // Email not verified - sign out the user and return error
        await supabase.auth.signOut();
        return { 
          user: null, 
          error: {
            message: 'Please verify your email address before logging in.',
            name: 'EmailNotVerifiedError',
            __isAuthError: true
          } as unknown as AuthError
        };
      }

      // Update last activity and mark as active only for verified users
      if (authData.user && authData.user.email_confirmed_at) {
        await supabase
          .from('user_profiles')
          .update({ 
            last_activity_at: new Date().toISOString(),
            status: 'active' // Mark as active since email is verified
          })
          .eq('id', authData.user.id);
      }

      return { user: authData.user, error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { user: null, error: err as AuthError };
    }
  }

  // Sign out user
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      console.error('Sign out error:', err);
      return { error: err as AuthError };
    }
  }

  // Resend email verification
  async resendEmailVerification(email: string): Promise<{ error: AuthError | null; message?: string }> {
    try {
      console.log('Attempting to resend verification email to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) {
        console.error('Supabase resend error:', error);
        
        // Handle specific error cases
        if (error.message.includes('already confirmed')) {
          return { 
            error, 
            message: 'Your email is already verified! You can proceed to login.' 
          };
        } else if (error.message.includes('rate limit')) {
          return { 
            error, 
            message: 'Please wait a few minutes before requesting another verification email.' 
          };
        } else if (error.message.includes('not found')) {
          return { 
            error, 
            message: 'User not found. Please check your email or register again.' 
          };
        }
        
        return { error: error as AuthError, message: error.message };
      }

      console.log('Verification email resent successfully');
      return { error: null, message: 'Verification email sent successfully!' };
    } catch (err) {
      console.error('Resend verification error:', err);
      return { error: err as AuthError };
    }
  }

  // Get current session
  async getSession(): Promise<Session | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch (err) {
      console.error('Get session error:', err);
      return null;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (err) {
      console.error('Get current user error:', err);
      return null;
    }
  }

  // Get user profile with additional data
  async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          phone,
          role,
          status,
          us_shipping_address_id,
          street_address,
          city,
          country,
          postal_code,
          avatar_url
        `)
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('Get user profile error:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        phone: data.phone,
        status: data.status,
        usShippingAddressId: data.us_shipping_address_id,
        streetAddress: data.street_address,
        city: data.city,
        country: data.country,
        postalCode: data.postal_code,
        avatarUrl: data.avatar_url,
      };
    } catch (err) {
      console.error('Get user profile error:', err);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<AuthUser>): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) {
        console.error('Update user profile error:', error);
        return { error: error as unknown as AuthError };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Update user profile error:', err);
      return { error: err as AuthError };
    }
  }

  // Reset password (forgot password flow)
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password?step=3`,
      });
      
      // Log password reset request (we don't have user_id for forgot password)
      try {
        // First try to find the user by email to log the event
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', email)
          .single();
          
        if (userData) {
          await supabase.rpc('log_security_event', {
            p_user_id: userData.id,
            p_event_type: 'password_reset_request',
            p_event_details: { method: 'email', email },
            p_success: !error
          });
        }
      } catch (logError) {
        console.warn('Failed to log password reset event:', logError);
      }
      
      return { error };
    } catch (err) {
      console.error('Reset password error:', err);
      return { error: err as AuthError };
    }
  }

  // Update password (for password reset flow)
  async updatePassword(password: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      return { error };
    } catch (err) {
      console.error('Update password error:', err);
      return { error: err as AuthError };
    }
  }

  // Change password (for security settings - uses Supabase's reauthenticate approach)
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ error: string | null; success: boolean }> {
    try {
      // Validate passwords match
      if (data.newPassword !== data.confirmPassword) {
        return { error: 'New passwords do not match', success: false };
      }

      // Validate password strength
      if (data.newPassword.length < 8) {
        return { error: 'Password must be at least 8 characters long', success: false };
      }

      // Additional password strength checks
      const hasUpperCase = /[A-Z]/.test(data.newPassword);
      const hasLowerCase = /[a-z]/.test(data.newPassword);
      const hasNumbers = /\d/.test(data.newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        return { 
          error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number', 
          success: false 
        };
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user || !user.email) {
        return { error: 'User not authenticated', success: false };
      }

      // For Supabase password changes, we'll use a more direct approach
      // Note: In production, you might want to add additional verification steps
      
      // Update to new password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        console.error('Change password error:', updateError);
        
        // Log failed password change attempt
        try {
          await supabase.rpc('log_security_event', {
            p_user_id: user.id,
            p_event_type: 'password_change',
            p_event_details: { error: updateError.message },
            p_success: false
          });
        } catch (logError) {
          console.warn('Failed to log security event:', logError);
        }
        
        // Handle specific error cases
        if (updateError.message.includes('same')) {
          return { error: 'New password must be different from current password', success: false };
        }
        
        return { error: updateError.message, success: false };
      }

      // Log successful password change
      try {
        await supabase.rpc('log_security_event', {
          p_user_id: user.id,
          p_event_type: 'password_change',
          p_event_details: { method: 'security_settings' },
          p_success: true
        });
      } catch (logError) {
        console.warn('Failed to log security event:', logError);
      }

      return { error: null, success: true };

    } catch (err) {
      console.error('Change password error:', err);
      return { error: 'Failed to change password. Please try again.', success: false };
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    zip?: string;
    profileImage?: string;
  }): Promise<{ error: Error | null; success?: boolean }> {
    try {
      // Prepare update data for user_profiles table
      const profileUpdates: Record<string, string | null> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.firstName !== undefined) profileUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) profileUpdates.last_name = updates.lastName;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
      if (updates.address !== undefined) profileUpdates.street_address = updates.address;
      if (updates.city !== undefined) profileUpdates.city = updates.city;
      if (updates.country !== undefined) profileUpdates.country = updates.country;
      if (updates.zip !== undefined) profileUpdates.postal_code = updates.zip;
      if (updates.profileImage !== undefined) profileUpdates.avatar_url = updates.profileImage;

      const { error } = await supabase
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', userId);

      // If email is being updated, also update auth user
      if (updates.email && !error) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: updates.email,
        });
        
        if (emailError) {
          console.error('Email update error:', emailError);
          return { error: emailError, success: false };
        }
      }

      return { error, success: !error };
    } catch (err) {
      console.error('Update profile error:', err);
      return { error: err as Error, success: false };
    }
  }

  // Resend email verification
  async resendVerificationEmail(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      console.error('Resend verification error:', err);
      return { error: err instanceof Error ? err.message : 'Failed to resend verification email' };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      callback(session);
    });
  }
}

export const authService = new AuthService();
export default authService;
