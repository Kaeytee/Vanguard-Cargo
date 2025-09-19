import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

/**
 * PublicRoute - Component to protect public routes from authenticated users
 * 
 * This component ensures that authenticated users cannot access authentication
 * pages like login, register, forgot password, etc. If an authenticated user
 * tries to access these pages, they will be redirected to the dashboard.
 * 
 * @param {ReactNode} children - The child components to render if not authenticated
 * @returns {JSX.Element} The public route component or redirect
 */
interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/app' 
}) => {
  const { user, profile, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // If user is authenticated and has an active account, redirect to app
  if (user && profile?.status === 'active') {
    return <Navigate to={redirectTo} replace />;
  }

  // If user is authenticated but has pending verification, allow access to verification pages
  // but redirect away from login/register pages
  if (user && profile?.status === 'pending_verification') {
    const currentPath = window.location.pathname;
    const verificationPages = ['/verify-email', '/resend-verification'];
    
    if (verificationPages.includes(currentPath)) {
      // Allow access to verification pages
      return <>{children}</>;
    } else {
      // Redirect to verification if trying to access other auth pages
      return <Navigate to="/verify-email" replace />;
    }
  }

  // User is not authenticated, allow access to public routes
  return <>{children}</>;
};

export default PublicRoute;
