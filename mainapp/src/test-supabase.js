// Simple script to test Supabase connection
import { supabase } from './lib/supabase.js';

console.log('Testing Supabase connection...');
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase Key:', supabase.supabaseKey?.substring(0, 20) + '...');

// Test auth session
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error);
  } else {
    console.log('✅ Supabase connected successfully!');
    console.log('Session data:', data);
  }
});

// Test a simple query to see if database is accessible
supabase.from('system_settings').select('*').limit(1).then(({ data, error }) => {
  if (error) {
    console.error('❌ Database query error:', error);
  } else {
    console.log('✅ Database accessible!');
    console.log('Sample data:', data);
  }
});
