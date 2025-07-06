/**
 * reCAPTCHA Configuration
 * 
 * This file contains configuration settings for Google reCAPTCHA integration.
 * It provides different site keys based on environment variables.
 * 
 * @module config/recaptcha
 */

/**
 * Helper function to safely access environment variables across different build systems
 * Works with both Vite (import.meta.env) and Create React App (process.env)
 */
const getEnvVariable = (key: string): string => {
  // First check import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const env = import.meta.env as Record<string, string>;
    const value = env[key];
    if (value && value.trim() !== '') return value.trim();
  }
  
  // Then check process.env (Node.js/Create React App)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value && value.trim() !== '') return value.trim();
  }
  
  return '';
};

/**
 * Get the reCAPTCHA site key from environment variables
 */
const getSiteKey = (): string => {
  const envKey = getEnvVariable('REACT_APP_RECAPTCHA_SITE_KEY');
  
  if (envKey && envKey.trim() !== '') {
    console.log('✅ Using reCAPTCHA site key from environment:', envKey.substring(0, 10) + '...');
    return envKey.trim();
  }
  
  // Fallback to Google's test key that works on all domains
  console.warn('⚠️ No reCAPTCHA site key found in environment variables. Using Google test key.');
  return "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
};

/**
 * Get the reCAPTCHA secret key from environment variables
 */
const getSecretKey = (): string => {
  const envKey = getEnvVariable('REACT_APP_RECAPTCHA_SECRET_KEY');
  
  if (envKey && envKey.trim() !== '') {
    console.log('✅ Using reCAPTCHA secret key from environment');
    return envKey.trim();
  }
  
  // Fallback to Google's test secret key
  console.warn('⚠️ No reCAPTCHA secret key found in environment variables. Using Google test secret key.');
  return "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
};

// Environment detection
// (isProduction variable removed as it was unused)
/**
 * No environment detection logic is needed here since isProduction was unused and removed.
 * All configuration is handled via environment variables and fallbacks.
 */
/**
 * reCAPTCHA configuration object
 */
export const recaptchaConfig = {
  /**
   * Site key for Google reCAPTCHA
   * Uses environment variables to get the appropriate key for the current environment
   * Falls back to Google's test key if no environment variable is found
   */
  siteKey: getSiteKey(),
  
  /**
   * Secret key for Google reCAPTCHA (for server-side verification)
   * Uses environment variables to get the appropriate key for the current environment
   * Falls back to Google's test secret key if no environment variable is found
   */
  secretKey: getSecretKey(),
  
  /**
   * Whether reCAPTCHA is enabled
   * Can be disabled via environment variable for quick deployment fixes
   */
  enabled: getEnvVariable('REACT_APP_ENABLE_RECAPTCHA') !== 'false',
  
  /**
   * Size of the reCAPTCHA widget
   * Options: 'normal', 'compact', 'invisible'
   */
  size: "normal" as "normal" | "compact" | "invisible",
  
  /**
   * Theme of the reCAPTCHA widget
   * Options: 'light', 'dark'
   */
  theme: "light" as "light" | "dark",
};

/**
 * Instructions for setting up reCAPTCHA:
 * 
 * 1. Go to https://www.google.com/recaptcha/admin
 * 2. Sign in with your Google account
 * 3. Register a new site
 *    - Choose reCAPTCHA v2 "I'm not a robot" Checkbox
 *    - Add your domain(s)
 *    - Accept the terms of service
 * 4. Get your Site Key and Secret Key
 * 5. Add your Site Key to the environment variables:
 *    - For development: REACT_APP_RECAPTCHA_SITE_KEY in .env.development
 *    - For production: REACT_APP_RECAPTCHA_SITE_KEY in .env.production
 * 6. Add your Secret Key to your backend API for verification:
 *    - For development: REACT_APP_RECAPTCHA_SECRET_KEY in .env.development
 *    - For production: REACT_APP_RECAPTCHA_SECRET_KEY in .env.production
 * 
 * Note: The secret key should ONLY be used on the server side and never exposed in client code.
 */
