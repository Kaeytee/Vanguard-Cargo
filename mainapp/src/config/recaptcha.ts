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
  // For Vite production builds, environment variables are replaced at build time
  // We need to check for the specific variables directly
  if (key === 'REACT_APP_RECAPTCHA_SITE_KEY') {
    // This will be replaced with the actual value during build if it exists
    const directValue = import.meta.env.REACT_APP_RECAPTCHA_SITE_KEY || '';
    if (directValue) return directValue;
  }
  
  if (key === 'REACT_APP_ENABLE_RECAPTCHA') {
    // This will be replaced with the actual value during build if it exists
    const directValue = import.meta.env.REACT_APP_ENABLE_RECAPTCHA || '';
    if (directValue) return directValue;
  }
  
  // Try Vite environment variables first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const env = import.meta.env as Record<string, string>;
    const value = env[key] || '';
    if (value) return value;
  }
  
  // Fall back to process.env for Create React App or Node.js environments
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key] || '';
    if (value) return value;
  }
  
  return '';
};

// Environment detection
const isProduction = 
  (typeof import.meta !== 'undefined' && import.meta.env?.PROD) || 
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');

/**
 * Get the appropriate reCAPTCHA site key based on environment
 */
const getReCaptchaSiteKey = (): string => {
  // Check if reCAPTCHA is disabled first
  const isEnabled = getEnvVariable('REACT_APP_ENABLE_RECAPTCHA') !== 'false';
  
  if (!isEnabled) {
    // If reCAPTCHA is disabled, return a placeholder key to prevent errors
    return 'disabled';
  }
  
  const envKey = getEnvVariable('REACT_APP_RECAPTCHA_SITE_KEY');
  
  if (envKey && envKey.trim() !== '') {
    return envKey.trim();
  }
  
  // In production, we should have a real key - return empty to trigger error handling
  if (isProduction) {
    // Check if we're running on Vercel
    const isVercel = typeof process !== 'undefined' && process.env?.VERCEL === '1';
    
    // For Vercel deployments, try to use the environment variable directly
    if (isVercel && process.env?.REACT_APP_RECAPTCHA_SITE_KEY) {
      return process.env.REACT_APP_RECAPTCHA_SITE_KEY;
    }
    
    console.warn('⚠️ No reCAPTCHA site key found in production environment. Please set REACT_APP_RECAPTCHA_SITE_KEY environment variable.');
    // Return the key from the .env.production.vercel file as a fallback
    return '6Lcj6nYrAAAAAFwZMNXkWO0Mv-Bf64cUsyC8o5WN';
  }
  
  // In development, use Google's test key as fallback
  console.warn('⚠️ Using Google test reCAPTCHA key for development. Set REACT_APP_RECAPTCHA_SITE_KEY environment variable for production.');
  return "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Google's test key
};

/**
 * reCAPTCHA configuration object
 */
export const recaptchaConfig = {
  /**
   * Site key for Google reCAPTCHA
   * Uses environment variables to get the appropriate key for the current environment
   * Falls back to Google's test key in development if no environment variable is found
   */
  siteKey: getReCaptchaSiteKey(),
  
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
