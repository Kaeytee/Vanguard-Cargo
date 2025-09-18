import { useState, useEffect } from 'react';

const SimpleSupabaseTest = () => {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Import Supabase client
        const { supabase } = await import('../lib/supabase');
        
        // Test basic connection
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus(`❌ Error: ${error.message}`);
        } else {
          setStatus('✅ Supabase connected successfully!');
          console.log('Supabase client working:', { data });
        }
      } catch (err) {
        setStatus(`❌ Connection failed: ${err}`);
        console.error('Supabase test error:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{
      backgroundColor: '#f3f4f6',
      padding: '20px',
      margin: '20px',
      borderRadius: '8px',
      border: '1px solid #d1d5db'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Supabase Connection Status</h3>
      <p style={{ margin: '0', fontWeight: 'bold' }}>{status}</p>
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
        <div>URL: {import.meta.env.VITE_SUPABASE_URL}</div>
        <div>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}</div>
      </div>
    </div>
  );
};

export default SimpleSupabaseTest;
