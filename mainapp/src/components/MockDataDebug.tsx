import React, { useState, useEffect } from 'react';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { supabase } from '../lib/supabase';

const SupabaseDebug: React.FC = () => {
  const { user, profile } = useAuth();
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Checking...');
  const [connectionDetails, setConnectionDetails] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        
        // Test Supabase connection
        const { error } = await supabase
          .from('user_profiles')
          .select('count')
          .limit(1);
        
        if (error) {
          setSupabaseStatus(`Connection Error: ${error.message}`);
        } else {
          setSupabaseStatus('✅ Connected to Supabase');
        }
        
        // Get session info
        const { data: session } = await supabase.auth.getSession();
        
        setConnectionDetails({
          isConnected: !error,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Not configured',
          hasSession: !!session.session,
          user: session.session?.user ? {
            id: session.session.user.id,
            email: session.session.user.email,
            role: session.session.user.user_metadata?.role || 'customer'
          } : null,
          authUser: user,
          profile: profile
        });
        
      } catch (err) {
        console.error('Error testing Supabase:', err);
        setSupabaseStatus('❌ Connection failed');
        setConnectionDetails({ error: err instanceof Error ? err.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };

    testSupabaseConnection();
  }, [user, profile]);

  if (loading) {
    return <div className="p-4 bg-blue-100 rounded">Checking Supabase connection...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-bold mb-4">Supabase Debug Panel</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Connection Status:</h4>
        <div className={`p-2 rounded text-sm ${supabaseStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {supabaseStatus}
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold">Connection Details:</h4>
        <pre className="bg-white p-2 rounded text-sm max-h-64 overflow-auto">
          {JSON.stringify(connectionDetails, null, 2)}
        </pre>
      </div>

      {user && (
        <div className="mb-4">
          <h4 className="font-semibold">Current User:</h4>
          <pre className="bg-white p-2 rounded text-sm">
            {JSON.stringify({ 
              id: user.id, 
              email: user.email,
              role: user.user_metadata?.role || 'customer'
            }, null, 2)}
          </pre>
        </div>
      )}

      {profile && (
        <div className="mb-4">
          <h4 className="font-semibold">User Profile:</h4>
          <pre className="bg-white p-2 rounded text-sm">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SupabaseDebug;
