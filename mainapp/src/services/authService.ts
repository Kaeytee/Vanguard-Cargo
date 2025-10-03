import { supabase } from '../lib/supabase';
import type { AuthError, User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'warehouse' | 'superadmin';
  phone?: string;
  suite_number?: string;
  status: 'pending_verification' | 'active' | 'suspended';
  avatarUrl?: string;
  profileImage?: string; // Alias for avatarUrl
  isEmailVerified?: boolean;
  accountStatus?: string;
  usShippingAddressId?: string | number;
  streetAddress?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface SignUpData {
  streetAddress: any;
  city: any;
  country: any;
  postalCode: any;
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
  async signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      console.log('Starting user registration for:', data.email);
      
      // Step 1: Create auth user with metadata
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone_number: data.phone,
            street_address: data.streetAddress,
            city: data.city,
            country: data.country,
            postal_code: data.postalCode,
          },
        },
      });
  
      if (error || !authData.user) {
        console.error('Auth signup failed:', error);
        return { user: null, error };
      }

      console.log('Auth user created successfully:', authData.user.id);
      
      // Step 2: Create user profile using secure RPC function
      try {
        console.log('Creating user profile via secure RPC function...');
        
        const { data: profileResult, error: rpcError } = await supabase.rpc('create_user_profile_secure', {
          user_id: authData.user.id,
          email: authData.user.email,
          first_name: data.firstName || 'User',
          last_name: data.lastName || 'Name',
          phone_number: data.phone || null,
          street_address: data.streetAddress || null,
          city: data.city || null,
          country: data.country || null,
          postal_code: data.postalCode || null
        });

        if (rpcError) {
          console.error('RPC function error:', rpcError);
          return { 
            user: null, 
            error: { 
              message: `Registration failed: ${rpcError.message}`,
              name: 'ProfileCreationError'
            } as AuthError 
          };
        }

        if (!profileResult?.success) {
          console.error('Profile creation failed:', profileResult?.error);
          return { 
            user: null, 
            error: { 
              message: `Registration failed: ${profileResult?.error || 'Unknown error'}`,
              name: 'ProfileCreationError'
            } as AuthError 
          };
        }

        console.log('User profile created successfully:', profileResult);
        console.log('Suite number assigned:', profileResult.user?.suite_number);
        console.log('Registration completed successfully for:', data.email);
        
        return { user: authData.user, error: null };
        
      } catch (profileCreationError) {
        console.error('Profile creation process failed:', profileCreationError);
        return { 
          user: null, 
          error: { 
            message: 'Registration failed during profile creation',
            name: 'ProfileCreationError'
          } as AuthError 
        };
      }
      
    } catch (err) {
      console.error('Registration process failed:', err);
      return { user: null, error: err as AuthError };
    }
  }

  async createUserProfile(userId: string, email: string, metadata: any): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: email,
          first_name: metadata.first_name || 'User',
          last_name: metadata.last_name || 'Name',
          phone_number: metadata.phone_number,
          status: 'active',
          email_verified: true
        }, {
          onConflict: 'id'
        });

      return { error: error ? error.message : null };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { error: 'Failed to create user profile' };
    }
  }

  async signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { user: null, error };
      }

      if (authData.user && !authData.user.email_confirmed_at) {
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

      if (authData.user && authData.user.email_confirmed_at) {
        await supabase
          .from('users')
          .update({ 
            last_activity_at: new Date().toISOString(),
            status: 'active'
          })
          .eq('id', authData.user.id);
      }

      return { user: authData.user, error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { user: null, error: err as AuthError };
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      console.error('Sign out error:', err);
      return { error: err as AuthError };
    }
  }

  async resendEmailVerification(email: string): Promise<{ error: AuthError | null; message?: string }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) {
        if (error.message.includes('already confirmed')) {
          return { error, message: 'Your email is already verified! You can proceed to login.' };
        }
        return { error, message: error.message };
      }
      return { error: null, message: 'Verification email sent successfully!' };
    } catch (err) {
      console.error('Resend verification error:', err);
      return { error: err as AuthError };
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch (err) {
      console.error('Get session error:', err);
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (err) {
      console.error('Get current user error:', err);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')  // Changed from 'user_profiles' to 'users'
        .select(`
          id,
          email,
          first_name,
          last_name,
          phone_number,
          role,
          status,
          suite_number,
          avatar_url,
          street_address,
          city,
          country,
          postal_code
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
        phone: data.phone_number,  // Load actual phone from signup
        status: data.status,
        suite_number: data.suite_number,
        usShippingAddressId: undefined, // Column removed from database
        streetAddress: data.street_address, // Load from database
        city: data.city, // Load from database
        country: data.country, // Load from database
        postalCode: data.postal_code, // Load from database
        avatarUrl: data.avatar_url,
        profileImage: data.avatar_url, // Add profileImage alias
        isEmailVerified: true, // Set default for existing users
        accountStatus: data.status, // Map status to accountStatus
      };
    } catch (err) {
      console.error('Get user profile error:', err);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<AuthUser>): Promise<{ error: AuthError | null }> {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.firstName) dbUpdates.first_name = updates.firstName;
      if (updates.lastName) dbUpdates.last_name = updates.lastName;
      if (updates.phone) dbUpdates.phone_number = updates.phone;
      if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.profileImage) dbUpdates.avatar_url = updates.profileImage;
      if (updates.status) dbUpdates.status = updates.status;
      
      // Add address field updates
      if (updates.streetAddress !== undefined) dbUpdates.street_address = updates.streetAddress;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.country !== undefined) dbUpdates.country = updates.country;
      if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode;

      const { error } = await supabase
        .from('users')
        .update(dbUpdates)
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

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password?step=3`,
      });
      return { error };
    } catch (err) {
      console.error('Reset password error:', err);
      return { error: err as AuthError };
    }
  }

  async updatePassword(password: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } catch (err) {
      console.error('Update password error:', err);
      return { error: err as AuthError };
    }
  }

  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string; }): Promise<{ error: string | null; success: boolean }> {
    try {
      if (data.newPassword !== data.confirmPassword) {
        return { error: 'New passwords do not match', success: false };
      }
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) {
        return { error: error.message, success: false };
      }
      return { error: null, success: true };
    } catch (err) {
      console.error('Change password error:', err);
      return { error: 'Failed to change password.', success: false };
    }
  }

  async updateProfile(userId: string, updates: { firstName?: string; lastName?: string; phone?: string; email?: string; profileImage?: string; streetAddress?: string; city?: string; country?: string; postalCode?: string; }): Promise<{ error: Error | null; success?: boolean }> {
    try {
      const profileUpdates: Record<string, string | null> = {};
      if (updates.firstName !== undefined) profileUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) profileUpdates.last_name = updates.lastName;
      if (updates.phone !== undefined) profileUpdates.phone_number = updates.phone;
      if (updates.profileImage !== undefined) profileUpdates.avatar_url = updates.profileImage;
      
      // Add address field updates
      if (updates.streetAddress !== undefined) profileUpdates.street_address = updates.streetAddress;
      if (updates.city !== undefined) profileUpdates.city = updates.city;
      if (updates.country !== undefined) profileUpdates.country = updates.country;
      if (updates.postalCode !== undefined) profileUpdates.postal_code = updates.postalCode;

      const { error } = await supabase
        .from('users')
        .update(profileUpdates)
        .eq('id', userId);

      if (updates.email && !error) {
        const { error: emailError } = await supabase.auth.updateUser({ email: updates.email });
        if (emailError) {
          return { error: emailError, success: false };
        }
      }

      return { error, success: !error };
    } catch (err) {
      console.error('Update profile error:', err);
      return { error: err as Error, success: false };
    }
  }

  async resendVerificationEmail(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      return { error: error ? error.message : null };
    } catch (err) {
      console.error('Resend verification error:', err);
      return { error: err instanceof Error ? err.message : 'Failed to resend verification email' };
    }
  }

  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }

}

export const authService = new AuthService();
export default authService;
