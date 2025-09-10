import { useContext } from 'react';
import UserContext from './UserContext';
import type { UserProfile } from '../services/api';

export interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
