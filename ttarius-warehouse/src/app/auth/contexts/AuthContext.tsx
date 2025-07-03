import React, { createContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

// Updated User and Role types for RBAC
export type UserRole = 'WORKER' | 'INVENTORY_ANALYST' | 'MANAGER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  permissions: RolePermissions;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  token: string;
}

export interface RolePermissions {
  dashboard: boolean;
  incomingRequests: boolean;
  createShipment: boolean;
  shipmentHistory: boolean;
  clientManagement: boolean;
  analysisReport: boolean;
  inventory: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasPermission: (permission: keyof RolePermissions) => boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

// Role-based permissions configuration
const getRolePermissions = (role: UserRole): RolePermissions => {
  switch (role) {
    case 'WORKER':
      return {
        dashboard: true,
        incomingRequests: true,
        createShipment: false,
        shipmentHistory: true,
        clientManagement: false,
        analysisReport: false,
        inventory: true,
      };
    case 'INVENTORY_ANALYST':
      return {
        dashboard: true,
        incomingRequests: false,
        createShipment: false,
        shipmentHistory: true,
        clientManagement: false,
        analysisReport: true,
        inventory: true,
      };
    case 'MANAGER':
      return {
        dashboard: true,
        incomingRequests: true,
        createShipment: true,
        shipmentHistory: true,
        clientManagement: false, // Not available in warehouse app
        analysisReport: true,
        inventory: true,
      };
    default:
      return {
        dashboard: false,
        incomingRequests: false,
        createShipment: false,
        shipmentHistory: false,
        clientManagement: false,
        analysisReport: false,
        inventory: false,
      };
  }
};

// Dummy user data for testing - Employee IDs (10 digits) and Passwords (6 characters)
const DUMMY_USERS: Record<string, { role: UserRole; name: string; department: string; password: string }> = {
  // WORKER Role - 3 employees
  '1234567890': { role: 'WORKER', name: 'John Michael Doe', department: 'Warehouse Operations', password: 'work01' },
  '2345678901': { role: 'WORKER', name: 'Maria Elena Santos', department: 'Warehouse Operations', password: 'work02' },
  '3456789012': { role: 'WORKER', name: 'David Chen Wang', department: 'Warehouse Operations', password: 'work03' },
  
  // INVENTORY_ANALYST Role - 3 employees
  '4567890123': { role: 'INVENTORY_ANALYST', name: 'Sarah Jane Smith', department: 'Inventory Management', password: 'inv001' },
  '5678901234': { role: 'INVENTORY_ANALYST', name: 'Ahmed Hassan Ali', department: 'Inventory Management', password: 'inv002' },
  '6789012345': { role: 'INVENTORY_ANALYST', name: 'Emily Rose Johnson', department: 'Inventory Management', password: 'inv003' },
  
  // MANAGER Role - 4 employees  
  '7890123456': { role: 'MANAGER', name: 'Alice Katherine Brown', department: 'Warehouse Management', password: 'mgr001' },
  '8901234567': { role: 'MANAGER', name: 'Robert James Wilson', department: 'Warehouse Management', password: 'mgr002' },
  '9012345678': { role: 'MANAGER', name: 'Jennifer Michelle Davis', department: 'Warehouse Management', password: 'mgr003' },
  '0123456789': { role: 'MANAGER', name: 'Carlos Eduardo Rodriguez', department: 'Warehouse Management', password: 'mgr004' },
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Mock API function to simulate authentication
  const mockAuthAPI = async (employeeId: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Validate employee ID format (must be 10 digits)
    if (!/^\d{10}$/.test(employeeId)) {
      throw new Error('Employee ID must be 10 digits');
    }
    
    // Validate password format (must be 6 characters)
    if (password.length !== 6) {
      throw new Error('Password must be 6 characters');
    }
    
    // Check if user exists in dummy data
    const userData = DUMMY_USERS[employeeId];
    
    if (!userData || password !== userData.password) {
      throw new Error('Invalid employee ID or password');
    }
    
    const permissions = getRolePermissions(userData.role);
    
    return {
      id: `emp_${employeeId}`,
      email: `${employeeId}@ttarius-logistics.com`,
      name: userData.name,
      role: userData.role,
      department: userData.department,
      permissions,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      token: `jwt-${userData.role.toLowerCase()}-${employeeId}`,
    };
  };

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const storedUser = localStorage.getItem('warehouse_user');
        const storedToken = localStorage.getItem('warehouse_token');
        
        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          
          // Verify token is still valid (in production, this would be an API call)
          if (user.token === storedToken) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          } else {
            // Token mismatch, clear storage
            localStorage.removeItem('warehouse_user');
            localStorage.removeItem('warehouse_token');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('warehouse_user');
        localStorage.removeItem('warehouse_token');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (employeeId: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const user = await mockAuthAPI(employeeId, password);
      
      // Store in localStorage
      localStorage.setItem('warehouse_user', JSON.stringify(user));
      localStorage.setItem('warehouse_token', user.token);
      localStorage.setItem('isAuthenticated', 'true');
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('warehouse_user');
    localStorage.removeItem('warehouse_token');
    localStorage.removeItem('isAuthenticated');
    
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    if (!state.user || !state.isAuthenticated) {
      return false;
    }
    return state.user.permissions[permission];
  };

  // Expose the logUnauthorizedAccess function globally for route guards
  useEffect(() => {
    if (state.user) {
      (window as { __logUnauthorizedAccess?: (resource: string) => void }).__logUnauthorizedAccess = (resource: string) => {
        console.log('Logging unauthorized access attempt:', {
          userId: state.user!.id,
          attemptedResource: resource,
          timestamp: new Date().toISOString(),
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        });
      };
    }
  }, [state.user]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    hasPermission,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
