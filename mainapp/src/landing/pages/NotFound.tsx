import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

/**
 * NotFound - Landing page 404 component
 * 
 * This component is shown when unauthenticated users navigate to a non-existent route.
 * It includes a call-to-action to sign up or go back to the homepage.
 */
const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Search className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, 
            deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Looking for something specific?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Link 
              to="/login" 
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors duration-200"
            >
              <h4 className="font-medium text-gray-900 mb-2">Client Login</h4>
              <p className="text-gray-600">Access your cargo dashboard</p>
            </Link>
            <Link 
              to="/register" 
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors duration-200"
            >
              <h4 className="font-medium text-gray-900 mb-2">Get Started</h4>
              <p className="text-gray-600">Create a new account</p>
            </Link>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Still need help? 
            <a 
              href="mailto:support@Vanguard-cargo.com" 
              className="text-red-600 hover:text-red-700 font-medium ml-1"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
