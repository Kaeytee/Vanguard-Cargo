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
        return { user: null, error };
      }
      
      // Step 2: Create user profile using secure RPC function
      try {
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
          return { 
            user: null, 
            error: { 
              message: `Registration failed: ${rpcError.message}`,
              name: 'ProfileCreationError'
            } as AuthError 
          };
        }

        if (!profileResult?.success) {
          return { 
            user: null, 
            error: { 
              message: `Registration failed: ${profileResult?.error || 'Unknown error'}`,
              name: 'ProfileCreationError'
            } as AuthError 
          };
        }

        return { user: authData.user, error: null };

      } catch (profileError) {
        return { 
          user: null, 
          error: { 
            message: 'Registration failed during profile creation',
            name: 'ProfileCreationError'
          } as AuthError 
        };
      }
    } catch (err) {
      return { 
        user: null, 
        error: { 
          message: 'Registration failed',
          name: 'RegistrationError'
        } as AuthError 
      };
    }
  }

  async signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error || !authData.user) {
        return { user: null, error };
      }

      return { user: authData.user, error: null };
    } catch (err) {
      return { 
        user: null, 
        error: { 
          message: 'Sign in failed',
          name: 'SignInError'
        } as AuthError 
      };
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      return { 
        error: { 
          message: 'Sign out failed',
          name: 'SignOutError'
        } as AuthError 
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (err) {
      return null;
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (err) {
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
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
        return null;
      }
  
      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        phone: data.phone_number,
        status: data.status,
        suite_number: data.suite_number,
        usShippingAddressId: undefined,
        streetAddress: data.street_address,
        city: data.city,
        country: data.country,
        postalCode: data.postal_code,
        avatarUrl: data.avatar_url,
        profileImage: data.avatar_url,
        isEmailVerified: true,
        accountStatus: data.status,
      };
    } catch (err) {
      return null;
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
        });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: 'Failed to create user profile' };
    }
  }

  async updateUserProfile(userId: string, updates: Partial<AuthUser>): Promise<{ error: AuthError | null }> {
    try {
      const dbUpdates: Record<string, any> = {};
      
      if (updates.firstName) dbUpdates.first_name = updates.firstName;
      if (updates.lastName) dbUpdates.last_name = updates.lastName;
      if (updates.phone) dbUpdates.phone_number = updates.phone;
      if (updates.streetAddress) dbUpdates.street_address = updates.streetAddress;
      if (updates.city) dbUpdates.city = updates.city;
      if (updates.country) dbUpdates.country = updates.country;
      if (updates.postalCode) dbUpdates.postal_code = updates.postalCode;
      if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;

      const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', userId);

      return { error };
    } catch (err) {
      return { 
        error: { 
          message: 'Profile update failed',
          name: 'ProfileUpdateError'
        } as AuthError 
      };
    }
  }

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (err) {
      return { 
        error: { 
          message: 'Password reset failed',
          name: 'PasswordResetError'
        } as AuthError 
      };
    }
  }

  async updatePassword(password: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } catch (err) {
      return { 
        error: { 
          message: 'Password update failed',
          name: 'PasswordUpdateError'
        } as AuthError 
      };
    }
  }

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
      return { error: 'Failed to resend verification email' };
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
