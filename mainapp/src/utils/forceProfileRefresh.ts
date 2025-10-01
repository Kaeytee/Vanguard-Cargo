// Force Profile Refresh Utility
// Clears cached profile data and forces re-fetch from database
// 
// @author Senior Software Engineer
// @version 1.0.0

import { supabase } from '../lib/supabase';

/**
 * Forces a complete profile refresh by clearing cache and re-fetching
 * Call this after database profile updates to ensure frontend sees changes
 */
export const forceProfileRefresh = async (): Promise<void> => {
  try {
    // Clear any cached session data
    await supabase.auth.refreshSession();
    
    // Force reload the page to clear all React state
    window.location.reload();
  } catch (error) {
    console.error('Error forcing profile refresh:', error);
    // Fallback: just reload the page
    window.location.reload();
  }
};

/**
 * Debug function to check current profile data in database
 */
export const debugProfileData = async (userId: string): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log('Current profile data in database:', data);
    console.log('Profile fetch error:', error);
  } catch (error) {
    console.error('Debug profile data error:', error);
  }
};
