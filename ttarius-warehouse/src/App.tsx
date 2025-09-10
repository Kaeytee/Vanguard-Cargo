
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from './app/auth/contexts/AuthContext';
import { useAuth } from './app/auth/hooks/useAuth';
import Login from './app/login';
import Dashboard from './app/pages/dashboard';
import AppLayout from './components/layout/AppLayout';
import IncomingRequest from './app/pages/IncomingRequest/IncomingRequest';
import CreateShipment from './app/pages/CreateShipment/CreateShipment';
import ShipmentHistory from './app/pages/ShipmentHistory/ShipmentHistory';
import AnalysisReport from './app/pages/AnalysisReport/AnalysisReport';
import Inventory from './app/pages/Inventory/Inventory';
import About from './app/pages/About/About';
import RouteGuard from './components/RouteGuard';
import UnauthorizedPage from './components/UnauthorizedPage';
// import GroupManagementDashboard from './app/pages/GroupManagement/GroupManagementDashboard'; // Removed from routing

/**
 * Protected Route Component
 * 
 * This component handles protected routes that require authentication.
 * It checks if the user is authenticated and redirects to login if not.
 */
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): React.ReactElement => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

/**
 * App Routes Component
 * 
 * Contains all the routing logic with role-based protection
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Protected Routes - All wrapped in AppLayout */}
      <Route 
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Accessible by all roles */}
        <Route 
          path="/dashboard" 
          element={
            <RouteGuard requiredPermission="dashboard">
              <Dashboard />
            </RouteGuard>
          } 
        />
        
        {/* Incoming Requests - Workers and Managers only */}
        <Route 
          path="/incoming-request" 
          element={
            <RouteGuard requiredPermission="incomingRequests">
              <IncomingRequest />
            </RouteGuard>
          } 
        />
        
        {/* Create Shipment - Managers only */}
        <Route 
          path="/create-shipment" 
          element={
            <RouteGuard requiredPermission="createShipment">
              <CreateShipment />
            </RouteGuard>
          } 
        />
        
        {/* Shipment History - All roles */}
        <Route 
          path="/shipment-history" 
          element={
            <RouteGuard requiredPermission="shipmentHistory">
              <ShipmentHistory />
            </RouteGuard>
          } 
        />
        
        {/* Analysis Report - Analysts and Managers only */}
        <Route 
          path="/analysis-report" 
          element={
            <RouteGuard requiredPermission="analysisReport">
              <AnalysisReport />
            </RouteGuard>
          } 
        />
        
        {/* Inventory - All roles */}
        <Route 
          path="/inventory" 
          element={
            <RouteGuard requiredPermission="inventory">
              <Inventory />
            </RouteGuard>
          } 
        />
        
        {/* Client Management - Redirect to unauthorized (not available in warehouse app) */}
        <Route 
          path="/client-management" 
          element={<Navigate to="/unauthorized" replace />} 
        />
        
        {/* About page - Public within authenticated area */}
        <Route path="/about" element={<About />} />
      </Route>
      
      {/* Index route - redirect based on authentication */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      
      {/* Catch-all route - redirect to unauthorized for unknown paths */}
      <Route 
        path="*" 
        element={<Navigate to="/unauthorized" replace />} 
      />
    </Routes>
  );
};

/**
 * Main App Component
 * 
 * Wraps the entire application with necessary providers and routing
 */
const App = (): React.ReactElement => {
  // Effect to check authentication status on app load
  useEffect(() => {
    // Initialize any global settings or analytics here
    console.log('Vanguard Cargo Warehouse App - Role-Based Access Control Enabled');
  }, []);
  
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
