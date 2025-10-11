// ============================================================================
// Rate Limiter - Brute Force Attack Prevention
// ============================================================================
// Description: Client-side rate limiting for authentication endpoints
// Author: Senior Software Engineer
// Security: Prevents brute force attacks on login/registration
// Features: Configurable limits, automatic cleanup, user feedback
// ============================================================================

import { StorageManager } from './storageManager';

/**
 * Rate limit attempt record
 */
interface RateLimitAttempt {
  /** Timestamp of the attempt */
  timestamp: number;
  
  /** IP address (if available) */
  ip?: string;
  
  /** User identifier (email, username, etc.) */
  identifier?: string;
}

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  /** Maximum number of attempts allowed */
  maxAttempts: number;
  
  /** Time window in milliseconds */
  windowMs: number;
  
  /** Storage key for this limiter */
  storageKey: string;
  
  /** Error message to show when limit exceeded */
  message?: string;
}

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  /** Whether the action is allowed */
  allowed: boolean;
  
  /** Number of remaining attempts */
  remainingAttempts: number;
  
  /** Time until reset in milliseconds */
  resetTimeMs: number;
  
  /** Human-readable reset time */
  resetTimeFormatted: string;
  
  /** Error message if blocked */
  message?: string;
}

/**
 * Rate Limiter Class
 * 
 * Implements client-side rate limiting to prevent brute force attacks
 * on authentication endpoints (login, registration, password reset).
 * 
 * Features:
 * - Configurable attempt limits and time windows
 * - Automatic cleanup of old attempts
 * - User-friendly error messages
 * - Integration with StorageManager for quota safety
 * - IP-based and identifier-based limiting
 * 
 * @class RateLimiter
 */
export class RateLimiter {
  getResetTime() {
    throw new Error('Method not implemented.');
  }
  private config: RateLimitConfig;
  
  /**
   * Create a new rate limiter
   * 
   * @param {RateLimitConfig} config - Rate limit configuration
   */
  constructor(config: RateLimitConfig) {
    this.config = config;
  }
  
  /**
   * Check if action is allowed and record attempt
   * 
   * @param {string} identifier - User identifier (email, IP, etc.)
   * @returns {RateLimitStatus} Rate limit status
   */
  public checkLimit(identifier?: string): RateLimitStatus {
    // Get existing attempts from storage
    const attempts = this.getAttempts();
    
    // Clean up old attempts outside the time window
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > windowStart);
    
    // Filter by identifier if provided
    const relevantAttempts = identifier
      ? recentAttempts.filter(attempt => attempt.identifier === identifier)
      : recentAttempts;
    
    // Check if limit exceeded
    const attemptsCount = relevantAttempts.length;
    const allowed = attemptsCount < this.config.maxAttempts;
    const remainingAttempts = Math.max(0, this.config.maxAttempts - attemptsCount);
    
    // Calculate reset time
    let resetTimeMs = 0;
    let resetTimeFormatted = '';
    
    if (!allowed && relevantAttempts.length > 0) {
      // Find oldest attempt in window
      const oldestAttempt = relevantAttempts.reduce((oldest, current) => 
        current.timestamp < oldest.timestamp ? current : oldest
      );
      
      resetTimeMs = (oldestAttempt.timestamp + this.config.windowMs) - now;
      resetTimeFormatted = this.formatResetTime(resetTimeMs);
    }
    
    return {
      allowed,
      remainingAttempts,
      resetTimeMs,
      resetTimeFormatted,
      message: allowed ? undefined : (this.config.message || this.getDefaultMessage(resetTimeFormatted))
    };
  }
  
  /**
   * Record an attempt
   * 
   * @param {string} identifier - User identifier (email, IP, etc.)
   * @returns {boolean} Whether attempt was recorded successfully
   */
  public recordAttempt(identifier?: string): boolean {
    try {
      // Get existing attempts
      const attempts = this.getAttempts();
      
      // Add new attempt
      const newAttempt: RateLimitAttempt = {
        timestamp: Date.now(),
        identifier
      };
      
      attempts.push(newAttempt);
      
      // Clean up old attempts to save storage
      const windowStart = Date.now() - this.config.windowMs;
      const recentAttempts = attempts.filter(attempt => attempt.timestamp > windowStart);
      
      // Save to storage using StorageManager for safety
      const success = StorageManager.safeSetItem(
        this.config.storageKey,
        JSON.stringify(recentAttempts)
      );
      
      if (!success) {
        console.warn('⚠️ Failed to record rate limit attempt - storage full');
      }
      
      return success;
    } catch (error) {
      console.error('Error recording rate limit attempt:', error);
      return false;
    }
  }
  
  /**
   * Get all attempts from storage
   * 
   * @private
   * @returns {RateLimitAttempt[]} Array of attempts
   */
  private getAttempts(): RateLimitAttempt[] {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) return [];
      
      const attempts = JSON.parse(stored);
      return Array.isArray(attempts) ? attempts : [];
    } catch (error) {
      console.error('Error reading rate limit attempts:', error);
      return [];
    }
  }
  
  /**
   * Clear all attempts (useful for testing or admin override)
   * 
   * @returns {void}
   */
  public clearAttempts(): void {
    try {
      localStorage.removeItem(this.config.storageKey);
      console.log(`✅ Rate limit attempts cleared for: ${this.config.storageKey}`);
    } catch (error) {
      console.error('Error clearing rate limit attempts:', error);
    }
  }
  
  /**
   * Get remaining time until next allowed attempt
   * 
   * @param {string} identifier - User identifier
   * @returns {number} Milliseconds until reset
   */
  public getTimeUntilReset(identifier?: string): number {
    const status = this.checkLimit(identifier);
    return status.resetTimeMs;
  }
  
  /**
   * Format reset time to human-readable string
   * 
   * @private
   * @param {number} ms - Milliseconds
   * @returns {string} Formatted time string
   */
  private formatResetTime(ms: number): string {
    if (ms <= 0) return 'now';
    
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }
    
    if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes}m`;
    }
    
    return `${seconds}s`;
  }
  
  /**
   * Get default error message
   * 
   * @private
   * @param {string} resetTime - Formatted reset time
   * @returns {string} Error message
   */
  private getDefaultMessage(resetTime: string): string {
    return `Too many attempts. Please try again in ${resetTime}.`;
  }
  
  /**
   * Get statistics about rate limit usage
   * 
   * @returns {Object} Statistics
   */
  public getStatistics(): {
    totalAttempts: number;
    uniqueIdentifiers: number;
    oldestAttempt: number | null;
    newestAttempt: number | null;
  } {
    const attempts = this.getAttempts();
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > windowStart);
    
    const uniqueIdentifiers = new Set(
      recentAttempts
        .filter(a => a.identifier)
        .map(a => a.identifier)
    ).size;
    
    return {
      totalAttempts: recentAttempts.length,
      uniqueIdentifiers,
      oldestAttempt: recentAttempts.length > 0
        ? Math.min(...recentAttempts.map(a => a.timestamp))
        : null,
      newestAttempt: recentAttempts.length > 0
        ? Math.max(...recentAttempts.map(a => a.timestamp))
        : null
    };
  }
}

// ============================================================================
// PRECONFIGURED RATE LIMITERS
// ============================================================================

/**
 * Login Rate Limiter
 * Limits: 5 attempts per 15 minutes
 */
export const loginRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  storageKey: 'rate_limit_login',
  message: 'Too many login attempts. Please try again in {resetTime}.'
});

/**
 * Registration Rate Limiter
 * Development: 10 attempts per 5 minutes (for testing)
 * Production: 3 attempts per hour (for security)
 * 
 * To switch to production mode, change:
 *   maxAttempts: 3
 *   windowMs: 60 * 60 * 1000 (1 hour)
 */
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

export const registrationRateLimiter = new RateLimiter({
  maxAttempts: isDevelopment ? 10 : 3, // 10 attempts in dev, 3 in prod
  windowMs: isDevelopment ? 5 * 60 * 1000 : 60 * 60 * 1000, // 5 min in dev, 1 hour in prod
  storageKey: 'rate_limit_registration',
  message: 'Too many registration attempts. Please try again in {resetTime}.'
});

/**
 * Password Reset Rate Limiter
 * Limits: 3 attempts per hour
 */
export const passwordResetRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  storageKey: 'rate_limit_password_reset',
  message: 'Too many password reset requests. Please try again in {resetTime}.'
});

/**
 * Email Verification Rate Limiter
 * Limits: 5 attempts per hour
 */
export const emailVerificationRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  storageKey: 'rate_limit_email_verification',
  message: 'Too many verification requests. Please try again in {resetTime}.'
});

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).rateLimiter = {
    login: loginRateLimiter,
    registration: registrationRateLimiter,
    passwordReset: passwordResetRateLimiter,
    emailVerification: emailVerificationRateLimiter
  };
  
  // Debug commands
  (window as any).clearRateLimits = () => {
    loginRateLimiter.clearAttempts();
    registrationRateLimiter.clearAttempts();
    passwordResetRateLimiter.clearAttempts();
    emailVerificationRateLimiter.clearAttempts();
    console.log('✅ All rate limits cleared');
  };
  
  (window as any).checkRateLimits = () => {
    console.log('Login:', loginRateLimiter.getStatistics());
    console.log('Registration:', registrationRateLimiter.getStatistics());
    console.log('Password Reset:', passwordResetRateLimiter.getStatistics());
    console.log('Email Verification:', emailVerificationRateLimiter.getStatistics());
  };
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Check and record login attempt
 * 
 * ```typescript
 * import { loginRateLimiter } from '@/utils/rateLimiter';
 * 
 * const handleLogin = async (email: string, password: string) => {
 *   // Check if login is allowed
 *   const status = loginRateLimiter.checkLimit(email);
 *   
 *   if (!status.allowed) {
 *     alert(status.message);
 *     return;
 *   }
 *   
 *   // Record attempt before trying
 *   loginRateLimiter.recordAttempt(email);
 *   
 *   // Attempt login
 *   const result = await authService.login(email, password);
 *   
 *   if (result.error) {
 *     console.log(`Remaining attempts: ${status.remainingAttempts - 1}`);
 *   }
 * };
 * ```
 * 
 * EXAMPLE 2: Show remaining attempts to user
 * 
 * ```typescript
 * const status = loginRateLimiter.checkLimit(email);
 * 
 * if (status.remainingAttempts <= 2 && status.remainingAttempts > 0) {
 *   console.warn(`⚠️ ${status.remainingAttempts} attempts remaining`);
 * }
 * ```
 * 
 * EXAMPLE 3: Custom rate limiter
 * 
 * ```typescript
 * const customLimiter = new RateLimiter({
 *   maxAttempts: 10,
 *   windowMs: 5 * 60 * 1000, // 5 minutes
 *   storageKey: 'rate_limit_custom',
 *   message: 'Too many requests. Slow down!'
 * });
 * ```
 */
