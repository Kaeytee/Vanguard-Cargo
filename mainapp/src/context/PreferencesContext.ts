import { createContext } from 'react';
import type { UserPreferences } from '../services/preferencesService';

export interface PreferencesContextType {
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

export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);
