import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Simple test to check if Supabase client is working
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('error');
          setErrorMessage(error.message);
        } else {
          console.log('Supabase connected successfully!');
          setConnectionStatus('connected');
        }
      } catch (err) {
        console.error('Connection test failed:', err);
        setConnectionStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'text-yellow-600';
      case 'connected':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Checking Supabase connection...';
      case 'connected':
        return '✓ Supabase connected successfully!';
      case 'error':
        return `✗ Connection failed: ${errorMessage}`;
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Supabase Connection Status</h3>
      <p className={`${getStatusColor()} font-medium`}>
        {getStatusText()}
      </p>
      {connectionStatus === 'connected' && (
        <div className="mt-2 text-sm text-gray-600">
          <p>✓ Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</p>
          <p>✓ Anonymous key configured</p>
        </div>
      )}
    </div>
  );
};

export default SupabaseConnectionTest;
