import React, { useState, useEffect } from 'react';

const ApiStatus: React.FC = () => {
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkApiConnection = async () => {
    setChecking(true);
    try {
      // Try to make a simple API call to check connection
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${apiBaseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      setApiConnected(response.ok);
    } catch (error) {
      console.error('API connection check failed:', error);
      setApiConnected(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkApiConnection();
  }, []);

  if (apiConnected === null || checking) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p>🔄 Checking API connection...</p>
      </div>
    );
  }

  if (!apiConnected) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>
          ⚠️ API Server not available at: <strong>{apiBaseUrl}</strong>
          <br />
          The application will use mock data instead.
        </p>
        <button 
          onClick={checkApiConnection}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <p>✅ API Server connected: <strong>{apiBaseUrl}</strong></p>
    </div>
  );
};

export default ApiStatus;
