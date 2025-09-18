import { supabase } from '../lib/supabase';

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_language: string;
  timezone: string;
  currency: string;
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  two_factor_enabled: boolean;
  marketing_consent: boolean;
  // Computed fields for backward compatibility
  language: string;
  units: 'metric' | 'imperial';
  autoRefresh: boolean;
}

export interface UpdateUserPreferencesRequest {
  preferred_language?: string;
  timezone?: string;
  currency?: string;
  email_notifications?: boolean;
  whatsapp_notifications?: boolean;
  sms_notifications?: boolean;
  push_notifications?: boolean;
  two_factor_enabled?: boolean;
  marketing_consent?: boolean;
  // Legacy fields
  language?: string;
  units?: 'metric' | 'imperial';
  autoRefresh?: boolean;
}

class PreferencesService {
  // Get user preferences
  async getUserPreferences(userId: string): Promise<{ data: UserPreferences | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          preferred_language,
          timezone,
          currency,
          email_notifications,
          whatsapp_notifications,
          sms_notifications,
          push_notifications,
          two_factor_enabled,
          marketing_consent
        `)
        .eq('id', userId)
        .single();

      if (error) {
        return { data: null, error };
      }

      if (!data) {
        return { data: null, error: new Error('User preferences not found') };
      }

      // Transform to match expected interface
      const preferences: UserPreferences = {
        ...data,
        user_id: data.id,
        language: data.preferred_language,
        units: 'metric' as const, // Default to metric, could be stored in user profile
        autoRefresh: true, // Default to true, could be stored in user profile
      };

      return { data: preferences, error: null };
    } catch (err) {
      console.error('Get user preferences error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Update user preferences
  async updateUserPreferences(
    userId: string, 
    updates: UpdateUserPreferencesRequest
  ): Promise<{ data: UserPreferences | null; error: Error | null }> {
    try {
      // Map legacy fields to new fields
      const dbUpdates: Record<string, any> = {};
      
      if (updates.language !== undefined) {
        dbUpdates.preferred_language = updates.language;
      }
      if (updates.preferred_language !== undefined) {
        dbUpdates.preferred_language = updates.preferred_language;
      }
      if (updates.timezone !== undefined) {
        dbUpdates.timezone = updates.timezone;
      }
      if (updates.currency !== undefined) {
        dbUpdates.currency = updates.currency;
      }
      if (updates.email_notifications !== undefined) {
        dbUpdates.email_notifications = updates.email_notifications;
      }
      if (updates.whatsapp_notifications !== undefined) {
        dbUpdates.whatsapp_notifications = updates.whatsapp_notifications;
      }
      if (updates.sms_notifications !== undefined) {
        dbUpdates.sms_notifications = updates.sms_notifications;
      }
      if (updates.push_notifications !== undefined) {
        dbUpdates.push_notifications = updates.push_notifications;
      }
      if (updates.two_factor_enabled !== undefined) {
        dbUpdates.two_factor_enabled = updates.two_factor_enabled;
      }
      if (updates.marketing_consent !== undefined) {
        dbUpdates.marketing_consent = updates.marketing_consent;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(dbUpdates)
        .eq('id', userId)
        .select(`
          id,
          preferred_language,
          timezone,
          currency,
          email_notifications,
          whatsapp_notifications,
          sms_notifications,
          push_notifications,
          two_factor_enabled,
          marketing_consent
        `)
        .single();

      if (error) {
        return { data: null, error };
      }

      // Transform to match expected interface
      const preferences: UserPreferences = {
        ...data,
        user_id: data.id,
        language: data.preferred_language,
        units: 'metric' as const,
        autoRefresh: true,
      };

      return { data: preferences, error: null };
    } catch (err) {
      console.error('Update user preferences error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Utility functions
  formatWeight(weight: number, unit: 'metric' | 'imperial' = 'metric'): string {
    if (unit === 'imperial') {
      return `${weight} lbs`;
    }
    return `${(weight * 0.453592).toFixed(1)} kg`;
  }

  formatDistance(distance: number, unit: 'metric' | 'imperial' = 'metric'): string {
    if (unit === 'imperial') {
      return `${distance} mi`;
    }
    return `${(distance * 1.60934).toFixed(1)} km`;
  }

  formatTemperature(temp: number, unit: 'metric' | 'imperial' = 'metric'): string {
    if (unit === 'imperial') {
      return `${temp}°F`;
    }
    const celsius = ((temp - 32) * 5) / 9;
    return `${celsius.toFixed(1)}°C`;
  }
}

export const preferencesService = new PreferencesService();
export default preferencesService;
