import React from 'react';

/**
 * Debug component to show current Supabase configuration
 * Remove this in production or hide it behind a debug flag
 */
export const SupabaseConfigDebug: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isDevelopment = import.meta.env.DEV;
  
  // Only show in development mode
  if (!isDevelopment) {
    return null;
  }

  const isConfigured = supabaseUrl && supabaseAnonKey;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-50">
      <div className="font-bold mb-1">Supabase Status</div>
      <div className={`px-2 py-1 rounded ${isConfigured ? 'bg-green-600' : 'bg-red-600'}`}>
        {isConfigured ? '✅ Configured' : '❌ Not Configured'}
      </div>
      {!isConfigured && (
        <div className="text-gray-300 mt-1">
          Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
        </div>
      )}
      {isConfigured && (
        <div className="text-gray-300 mt-1">
          Connected to: {supabaseUrl?.split('//')[1]?.split('.')[0]}
        </div>
      )}
    </div>
  );
};

export default SupabaseConfigDebug;