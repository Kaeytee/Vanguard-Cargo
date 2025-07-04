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
  // Try Vite environment variables first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as any)[key] || '';
  }
  
  // Fall back to process.env for Create React App or Node.js environments
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  
  return '';
};

// Environment detection
const isProduction = 
  (typeof import.meta !== 'undefined' && import.meta.env?.PROD) || 
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');

/**
 * reCAPTCHA configuration object
 */
export const recaptchaConfig = {
  /**
   * Site key for Google reCAPTCHA
   * Uses environment variables to get the appropriate key for the current environment
   * Falls back to Google's test key if no environment variable is found
   */
  siteKey: getEnvVariable('REACT_APP_RECAPTCHA_SITE_KEY') || 
    (isProduction 
      ? "" // Empty string will cause an error in production if env var is missing
      : "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"), // Google's test key as fallback for development
  
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
