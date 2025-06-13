
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import Login from './app/login';
import Dashboard from './app/dashboard';

/**
 * Protected Route Component
 * 
 * This component handles protected routes that require authentication.
 * It checks if the user is authenticated and redirects to login if not.
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render if authenticated
 * @returns {JSX.Element} Protected route component
 */
/**
 * Type definition for ProtectedRoute props
 */
interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected Route Component implementation
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps): React.ReactElement => {
  const location = useLocation();
  
  // In a real application, you would check for a valid authentication token
  // For this demo, we'll just check if the user came from the login page
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;

};

/**
 * App Component
 * 
 * This is the main application component that handles routing.
 * It sets up the routes for the application, including login and dashboard.
 * Protected routes require authentication to access.
 */
/**
 * Main App Component
 * 
 * @returns {JSX.Element} The main application component
 */
/**
 * Main App Component implementation
 */
const App = (): React.ReactElement => {
  // Effect to check authentication status on app load
  useEffect(() => {
    // This would typically check for a valid token in local storage or cookies
    // For demo purposes, we'll just initialize it if it doesn't exist
    if (!sessionStorage.getItem('isAuthenticated')) {
      sessionStorage.setItem('isAuthenticated', 'false');
    }
  }, []);
  
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Default route - redirect to dashboard if authenticated, otherwise to login */}
        <Route 
          path="*" 
          element={
            sessionStorage.getItem('isAuthenticated') === 'true' ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
