import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../app/auth/hooks/useAuth';
import type { RolePermissions } from '../app/auth/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermission: keyof RolePermissions;
  redirectTo?: string;
}

/**
 * RouteGuard Component
 * 
 * Protects routes based on user permissions and logs unauthorized access attempts.
 * Redirects unauthorized users to /unauthorized page.
 * 
 * @param children - The component to render if authorized
 * @param requiredPermission - The permission required to access this route
 * @param redirectTo - Optional custom redirect path
 */
const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requiredPermission, 
  redirectTo = '/unauthorized' 
}) => {
  const { user, isAuthenticated, hasPermission, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required permission
  if (!hasPermission(requiredPermission)) {
    // Log unauthorized access attempt
    const logUnauthorizedAccess = (window as { __logUnauthorizedAccess?: (resource: string) => void }).__logUnauthorizedAccess;
    if (logUnauthorizedAccess) {
      logUnauthorizedAccess(location.pathname);
    }

    // Redirect to unauthorized page with state
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location,
          requiredPermission,
          userRole: user.role,
          attemptedPath: location.pathname
        }} 
        replace 
      />
    );
  }

  // User is authorized, render the protected component
  return <>{children}</>;
};

export default RouteGuard;
