// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // Database configuration
  db: {
    schema: 'public',
  },
  
  // Auth configuration
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  
  // Real-time configuration with Cloudflare cookie fix
  realtime: {
    enabled: import.meta.env.VITE_DISABLE_REALTIME !== 'true',
    // Fix for Cloudflare __cf_bm cookie issues
    params: {
      eventsPerSecond: 10,
    },
  },
} as const;

// Validate required environment variables
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
  console.error('Missing required Supabase environment variables');
  console.error('Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

export default SUPABASE_CONFIG;
