import React from 'react';
import { getApiConfig } from '../services/api';

/**
 * Debug component to show current API configuration
 * Remove this in production or hide it behind a debug flag
 */
export const ApiConfigDebug: React.FC = () => {
  const config = getApiConfig();
  
  // Only show in development mode (when not using real API base URL)
  if (config.apiBaseUrl && !config.apiBaseUrl.includes('localhost')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-50">
      <div className="font-bold mb-1">API Mode</div>
      <div className={`px-2 py-1 rounded ${config.useMockData ? 'bg-orange-600' : 'bg-green-600'}`}>
        {config.useMockData ? 'Mock Data' : 'Real API'}
      </div>
      {config.useMockData && (
        <div className="text-gray-300 mt-1">
          Set REACT_APP_USE_MOCK_DATA=false to use real API
        </div>
      )}
    </div>
  );
};

export default ApiConfigDebug;