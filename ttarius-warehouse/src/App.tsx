
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import Login from './app/login';
import Dashboard from './app/pages/dashboard';
import AppLayout from './components/layout/AppLayout';

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
        
        {/* Protected Routes - All wrapped in AppLayout */}
        <Route 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Other protected routes will be added here */}
          <Route path="/create-shipment" element={<div className="py-6"><h1 className="text-2xl font-semibold">Create Shipment</h1><p>Create shipment page content will go here</p></div>} />
          <Route path="/incoming-request" element={<div className="py-6"><h1 className="text-2xl font-semibold">Incoming Request</h1><p>Incoming request page content will go here</p></div>} />
          <Route path="/shipment-history" element={<div className="py-6"><h1 className="text-2xl font-semibold">Shipment History</h1><p>Shipment history page content will go here</p></div>} />
          <Route path="/client-management" element={<div className="py-6"><h1 className="text-2xl font-semibold">Client Management</h1><p>Client management page content will go here</p></div>} />
          <Route path="/analysis-report" element={<div className="py-6"><h1 className="text-2xl font-semibold">Analysis Report</h1><p>Analysis report page content will go here</p></div>} />
          <Route path="/inventory" element={<div className="py-6"><h1 className="text-2xl font-semibold">Inventory</h1><p>Inventory page content will go here</p></div>} />
          <Route path="/about" element={<div className="py-6"><h1 className="text-2xl font-semibold">About Us</h1><p>About us page content will go here</p></div>} />
          <Route path="/support" element={<div className="py-6"><h1 className="text-2xl font-semibold">Support</h1><p>Support page content will go here</p></div>} />
          <Route path="/settings" element={<div className="py-6"><h1 className="text-2xl font-semibold">Settings</h1><p>Settings page content will go here</p></div>} />
        </Route>
        
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
