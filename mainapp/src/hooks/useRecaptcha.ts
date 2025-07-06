import { useState, useEffect, useRef } from 'react';
import { recaptchaConfig } from '../config/recaptcha';

declare global {
  interface Window {
    onRecaptchaLoad?: () => void;
  }
}

interface UseRecaptchaReturn {
  isLoading: boolean;
  isError: boolean;
  isReady: boolean;
  reload: () => void;
  resetError: () => void;
}

/**
 * Custom hook to manage reCAPTCHA script loading and state
 * Provides better error handling and retry mechanisms
 */
export const useRecaptcha = (): UseRecaptchaReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (window.onRecaptchaLoad) {
      delete window.onRecaptchaLoad;
    }
  };

  const resetError = () => {
    setIsError(false);
  };

  const checkIfReady = (): boolean => {
    if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
      window.grecaptcha.ready(() => {
        setIsReady(true);
        setIsLoading(false);
        setIsError(false);
      });
      return true;
    }
    return false;
  };

  const reload = () => {
    cleanup();
    setIsLoading(false);
    setIsError(false);
    setIsReady(false);
    setAttempted(false);
    
    // Small delay before retrying
    setTimeout(() => {
      setAttempted(false); // This will trigger the useEffect to run again
    }, 100);
  };

  useEffect(() => {
    const loadScript = () => {
      if (isLoading || (!recaptchaConfig.enabled || recaptchaConfig.siteKey === 'disabled')) {
        return;
      }

      // Check if already loaded
      if (checkIfReady()) {
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setAttempted(true);

      // Remove existing script if present
      const existingScript = document.querySelector('script[src*="recaptcha"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create new script
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoad';
      script.async = true;
      script.defer = true;

      // Global callback for when reCAPTCHA loads
      window.onRecaptchaLoad = () => {
        console.log('reCAPTCHA loaded via callback');
        if (checkIfReady()) {
          cleanup();
        }
      };

      const handleLoad = () => {
        console.log('reCAPTCHA script loaded');
        // Give time for grecaptcha to initialize
        setTimeout(() => {
          if (!checkIfReady()) {
            console.error('reCAPTCHA script loaded but grecaptcha not available');
            setIsError(true);
            setIsLoading(false);
          }
        }, 2000);
      };

      const handleError = () => {
        console.error('Failed to load reCAPTCHA script');
        setIsError(true);
        setIsLoading(false);
        cleanup();
      };

      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);

      scriptRef.current = script;
      document.head.appendChild(script);

      // Set timeout as fallback
      timeoutRef.current = setTimeout(() => {
        if (!window.grecaptcha || typeof window.grecaptcha.ready !== 'function') {
          console.error('reCAPTCHA loading timeout');
          setIsError(true);
          setIsLoading(false);
          cleanup();
        }
      }, 15000); // 15 second timeout
    };

    if (!attempted && recaptchaConfig.enabled && recaptchaConfig.siteKey !== 'disabled') {
      loadScript();
    }

    return cleanup;
  }, [attempted, isLoading]);

  return {
    isLoading,
    isError,
    isReady,
    reload,
    resetError,
  };
};
