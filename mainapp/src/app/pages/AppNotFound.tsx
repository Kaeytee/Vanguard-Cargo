import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Package, Clock, BarChart3 } from 'lucide-react';

/**
 * AppNotFound - In-app 404 component
 * 
 * This component is shown when authenticated users navigate to a non-existent route within the app.
 * It uses the app layout with sidebar and navbar.
 */
const AppNotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Search className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved, 
            deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center mb-12">
          <Link
            to="/app/dashboard"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              to="/app/dashboard" 
              className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors duration-200 group"
            >
              <Package className="w-8 h-8 text-red-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Dashboard</h4>
                <p className="text-sm text-gray-600">Go back to dashboard</p>
              </div>
            </Link>
            
            <Link 
              to="/app/shipment-history" 
              className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors duration-200 group"
            >
              <Clock className="w-8 h-8 text-red-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Shipment History</h4>
                <p className="text-sm text-gray-600">View past shipments</p>
              </div>
            </Link>
            
            <Link 
              to="/app/tracking" 
              className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors duration-200 group"
            >
              <Search className="w-8 h-8 text-red-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Track Package</h4>
                <p className="text-sm text-gray-600">Live tracking updates</p>
              </div>
            </Link>
            
            <Link 
              to="/app/settings" 
              className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors duration-200 group"
            >
              <BarChart3 className="w-8 h-8 text-red-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Settings</h4>
                <p className="text-sm text-gray-600">Account preferences</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need assistance? 
            <Link 
              to="/app/support" 
              className="text-red-600 hover:text-red-700 font-medium ml-1"
            >
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppNotFound;
