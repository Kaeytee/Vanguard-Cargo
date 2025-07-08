import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiService } from '../services/api';

interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  image?: string;
  avatar?: string;
  profileImage?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  emailVerified?: boolean;
  accountStatus?: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'RESTRICTED' | 'BANNED' | 'DORMANT';
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, recaptchaToken?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  // Real API login function
  const login = useCallback(async (email: string, password: string, recaptchaToken?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Call real API login endpoint
      const response = await apiService.login(email, password, recaptchaToken);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        // Store authentication token
        localStorage.setItem('authToken', token);
        
        // Store user data
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Login successful:', userData);
        return true;
      } else {
        console.error('Login failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real API logout function
  const logout = useCallback(async () => {
    try {
      // Call real API logout endpoint
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      setUser(null);
    }
  }, []);

  // Update user function with optional API sync
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      const updatedUser = {
        ...prevUser,
        ...userData,
        name: userData.name || (userData.firstName || userData.lastName) 
          ? `${userData.firstName || prevUser.firstName || ''} ${userData.lastName || prevUser.lastName || ''}`.trim()
          : prevUser.name
      };
      
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    });
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
