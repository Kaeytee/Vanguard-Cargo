import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService, type UserPreferences } from '../services/api';
import { useTranslation } from '../lib/translations';

interface PreferencesContextType {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
  // Utility functions for easy access
  language: string;
  units: 'metric' | 'imperial';
  autoRefresh: boolean;
  // Unit conversion helpers
  formatWeight: (weight: number) => string;
  formatDistance: (distance: number) => string;
  formatTemperature: (temp: number) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

interface PreferencesProviderProps {
  children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
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
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUserPreferences();
      
      if (response.success && response.data) {
        setPreferences(response.data);
      } else {
        setError(response.message || 'Failed to load preferences');
        // Set default preferences if loading fails
        setPreferences({
          id: 'default',
          userId: 'default',
          language: 'en',
          units: 'metric',
          autoRefresh: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError('Failed to load preferences');
      // Set default preferences if loading fails
      setPreferences({
        id: 'default',
        userId: 'default',
        language: 'en',
        units: 'metric',
        autoRefresh: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!preferences) return;

    try {
      const response = await apiService.updateUserPreferences(newPreferences);
      
      if (response.success && response.data) {
        setPreferences(response.data);
        setError(null);
      } else {
        throw new Error(response.message || 'Failed to update preferences');
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update preferences');
      throw err;
    }
  };

  const refreshPreferences = async () => {
    await loadPreferences();
  };

  // Unit conversion helpers
  const formatWeight = (weight: number): string => {
    if (!preferences) return `${weight} kg`;
    
    if (preferences.units === 'imperial') {
      const lbs = (weight * 2.20462).toFixed(1);
      return `${lbs} lbs`;
    }
    return `${weight} kg`;
  };

  const formatDistance = (distance: number): string => {
    if (!preferences) return `${distance} km`;
    
    if (preferences.units === 'imperial') {
      const miles = (distance * 0.621371).toFixed(1);
      return `${miles} mi`;
    }
    return `${distance} km`;
  };

  const formatTemperature = (temp: number): string => {
    if (!preferences) return `${temp}°C`;
    
    if (preferences.units === 'imperial') {
      const fahrenheit = ((temp * 9/5) + 32).toFixed(1);
      return `${fahrenheit}°F`;
    }
    return `${temp}°C`;
  };

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

export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
