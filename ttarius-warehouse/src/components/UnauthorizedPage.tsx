import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/auth/hooks/useAuth';
import { FiAlertTriangle, FiArrowLeft, FiHome } from 'react-icons/fi';

/**
 * Unauthorized Page Component
 * 
 * Displays when a user attempts to access a route they don't have permission for.
 * Shows relevant information about the attempted access and provides navigation options.
 */
const UnauthorizedPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Extract state from navigation
  const state = location.state as {
    from?: Location;
    requiredPermission?: string;
    userRole?: string;
    attemptedPath?: string;
  } | null;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'WORKER': return 'Worker';
      case 'INVENTORY_ANALYST': return 'Inventory Analyst';
      case 'MANAGER': return 'Warehouse Manager';
      default: return 'User';
    }
  };

  const getPermissionDisplayName = (permission: string) => {
    switch (permission) {
      case 'dashboard': return 'Dashboard Access';
      case 'incomingRequests': return 'Incoming Requests Management';
      case 'createShipment': return 'Shipment Creation';
      case 'shipmentHistory': return 'Shipment History';
      case 'clientManagement': return 'Client Management';
      case 'analysisReport': return 'Analysis Reports';
      case 'inventory': return 'Inventory Management';
      default: return 'This Feature';
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Error Icon */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You do not have permission to access this page.
          </p>

          {/* Role-specific information */}
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-blue-900 mb-2">Access Information</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Your Role:</strong> {getRoleDisplayName(user.role)}</p>
                {state?.requiredPermission && (
                  <p><strong>Required Permission:</strong> {getPermissionDisplayName(state.requiredPermission)}</p>
                )}
                {state?.attemptedPath && (
                  <p><strong>Attempted Path:</strong> {state.attemptedPath}</p>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">Need Access?</h3>
            <p className="text-sm text-gray-600">
              If you believe you should have access to this feature, please contact your 
              warehouse manager or system administrator.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            <FiHome className="w-4 h-4 mr-2" />
            Go to Dashboard
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            This attempt has been logged for security purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
