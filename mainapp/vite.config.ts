import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration
 * Enhanced to properly handle environment variables in production builds
 * @author Senior Software Engineer
 */
export default defineConfig(({ command, mode }) => {
  // Load env file based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    css: {
      devSourcemap: true,
    },
    build: {
      sourcemap: true,
      cssMinify: true,
    },
    // Define environment variables that should be replaced at build time
    define: {
      // Ensure reCAPTCHA environment variables are properly replaced
      'import.meta.env.REACT_APP_RECAPTCHA_SITE_KEY': JSON.stringify(env.REACT_APP_RECAPTCHA_SITE_KEY || ''),
      'import.meta.env.REACT_APP_ENABLE_RECAPTCHA': JSON.stringify(env.REACT_APP_ENABLE_RECAPTCHA || 'true'),
      // Add other critical environment variables here
      'import.meta.env.REACT_APP_ENVIRONMENT': JSON.stringify(env.REACT_APP_ENVIRONMENT || 'production'),
    }
  }
})