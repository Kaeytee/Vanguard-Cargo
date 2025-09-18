import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { preferencesService, type UserPreferences } from '../services/preferencesService';
import { useAuth } from '../hooks/useAuth';
import { PreferencesContext, type PreferencesContextType } from './PreferencesContext';

interface PreferencesProviderProps {
  children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (preferences) {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      // Also save language separately for quick access
      localStorage.setItem('selectedLanguage', preferences.language);
      localStorage.setItem('selectedUnits', preferences.units);
      
      // Dispatch custom event to notify components about language change
      window.dispatchEvent(new CustomEvent('languageChanged'));
    }
  }, [preferences]);

  const loadPreferences = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await preferencesService.getUserPreferences(user.id);
      
      if (!response.error && response.data) {
        setPreferences(response.data);
      } else {
        setError(response.error?.message || 'Failed to load preferences');
        // Set default preferences if loading fails
        const defaultPreferences: UserPreferences = {
          id: user.id,
          user_id: user.id,
          preferred_language: 'en',
          timezone: 'Africa/Accra',
          currency: 'USD',
          email_notifications: true,
          whatsapp_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          two_factor_enabled: false,
          marketing_consent: false,
          language: 'en',
          units: 'metric',
          autoRefresh: true,
        };
        setPreferences(defaultPreferences);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError('Failed to load preferences');
      // Set default preferences if loading fails
      const defaultPreferences: UserPreferences = {
        id: user.id,
        user_id: user.id,
        preferred_language: 'en',
        timezone: 'Africa/Accra',
        currency: 'USD',
        email_notifications: true,
        whatsapp_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        two_factor_enabled: false,
        marketing_consent: false,
        language: 'en',
        units: 'metric',
        autoRefresh: true,
      };
      setPreferences(defaultPreferences);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Error parsing saved preferences:', err);
      }
    }
    // If no saved preferences, load from API
    loadPreferences();
  }, [loadPreferences, user?.id]);

  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!preferences || !user?.id) return;

    try {
      const response = await preferencesService.updateUserPreferences(user.id, newPreferences);
      
      if (!response.error && response.data) {
        setPreferences(response.data);
        setError(null);
      } else {
        throw new Error(response.error?.message || 'Failed to update preferences');
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update preferences');
      throw err;
    }
  }, [preferences, user?.id]);

  const refreshPreferences = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  // Unit conversion helpers
  const formatWeight = useCallback((weight: number): string => {
    const unit = preferences?.units || 'metric';
    return preferencesService.formatWeight(weight, unit);
  }, [preferences?.units]);

  const formatDistance = useCallback((distance: number): string => {
    const unit = preferences?.units || 'metric';
    return preferencesService.formatDistance(distance, unit);
  }, [preferences?.units]);

  const formatTemperature = useCallback((temp: number): string => {
    const unit = preferences?.units || 'metric';
    return preferencesService.formatTemperature(temp, unit);
  }, [preferences?.units]);

  const contextValue: PreferencesContextType = {
    preferences,
    loading,
    error,
    updatePreferences,
    refreshPreferences,
    language: preferences?.language || 'en',
    units: preferences?.units || 'metric',
    autoRefresh: preferences?.autoRefresh || false,
    formatWeight,
    formatDistance,
    formatTemperature
  };

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
}


