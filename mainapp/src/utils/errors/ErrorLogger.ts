// ============================================================================
// Error Logger
// ============================================================================
// Description: Centralized error logging and reporting system
// Author: Senior Software Engineer
// Purpose: Log errors for debugging and monitoring
// Features: Console logging, remote reporting, error aggregation
// ============================================================================

import { AppError, ErrorSeverity, ErrorCategory, isAppError } from './CustomErrors';

/**
 * Log Levels
 */
export const LogLevel = {
  /** Debug level */
  DEBUG: 'debug',
  
  /** Info level */
  INFO: 'info',
  
  /** Warning level */
  WARN: 'warn',
  
  /** Error level */
  ERROR: 'error',
  
  /** Critical level */
  CRITICAL: 'critical',
  
  /** Fatal level */
  FATAL: 'fatal'
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

/**
 * Error Log Entry
 */
export interface ErrorLogEntry {
  /** Unique log ID */
  id: string;
  
  /** Timestamp */
  timestamp: Date;
  
  /** Log level */
  level: LogLevel;
  
  /** Error object */
  error: AppError | Error;
  
  /** User ID (if available) */
  userId?: string;
  
  /** Session ID */
  sessionId?: string;
  
  /** Browser/environment info */
  environment?: {
    userAgent?: string;
    platform?: string;
    language?: string;
    screenResolution?: string;
    url?: string;
  };
  
  /** Additional context */
  context?: Record<string, any>;
}

/**
 * Error Statistics
 */
export interface ErrorStatistics {
  /** Total errors logged */
  total: number;
  
  /** Errors by severity */
  bySeverity: Record<ErrorSeverity, number>;
  
  /** Errors by category */
  byCategory: Record<ErrorCategory, number>;
  
  /** Recent errors */
  recent: ErrorLogEntry[];
}

/**
 * Logger Configuration
 */
export interface LoggerConfig {
  /** Enable console logging */
  enableConsole?: boolean;
  
  /** Enable remote reporting */
  enableRemote?: boolean;
  
  /** Remote endpoint URL */
  remoteEndpoint?: string;
  
  /** Maximum logs to keep in memory */
  maxLogs?: number;
  
  /** Minimum level to log */
  minLevel?: LogLevel;
  
  /** Enable performance logging */
  enablePerformance?: boolean;
}

/**
 * ErrorLogger Class
 * 
 * Centralized error logging system with console and remote reporting.
 * Tracks errors, provides statistics, and sends errors to monitoring services.
 * 
 * Features:
 * - Console logging with colors
 * - Remote error reporting
 * - Error aggregation and statistics
 * - Session tracking
 * - Environment information
 * - Performance logging
 * 
 * @class ErrorLogger
 */
export class ErrorLogger {
  private static instance: ErrorLogger | null = null;
  private logs: ErrorLogEntry[] = [];
  private config: LoggerConfig;
  private sessionId: string;
  
  /**
   * Private constructor (singleton)
   */
  private constructor(config: LoggerConfig = {}) {
    this.config = {
      enableConsole: true,
      enableRemote: false,
      maxLogs: 100,
      minLevel: LogLevel.DEBUG,
      enablePerformance: true,
      ...config
    };
    
    // Generate session ID
    this.sessionId = this.generateSessionId();
    
    // Set up global error handlers
    if (typeof window !== 'undefined') {
      this.setupGlobalHandlers();
    }
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(config?: LoggerConfig): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger(config);
    }
    return ErrorLogger.instance;
  }
  
  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.logError(
        new Error(event.message),
        {
          component: 'GlobalErrorHandler',
          action: 'unhandledError',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      );
    });
    
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          component: 'GlobalErrorHandler',
          action: 'unhandledRejection'
        }
      );
    });
  }
  
  /**
   * Get environment information
   */
  private getEnvironment(): ErrorLogEntry['environment'] {
    if (typeof window === 'undefined') {
      return undefined;
    }
    
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      url: window.location.href
    };
  }
  
  /**
   * Create log entry
   */
  private createLogEntry(
    error: Error | AppError,
    level: LogLevel,
    context?: Record<string, any>
  ): ErrorLogEntry {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      error,
      sessionId: this.sessionId,
      environment: this.getEnvironment(),
      context
    };
  }
  /**
   * Should log based on level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'critical', 'fatal'];
    const minLevelIndex = levels.indexOf(this.config.minLevel as string);
    const currentLevelIndex = levels.indexOf(level as string);
    return currentLevelIndex >= minLevelIndex;
  }
  
  /**
   * Log to console with formatting
   */
  private logToConsole(entry: ErrorLogEntry): void {
    if (!this.config.enableConsole || !this.shouldLog(entry.level)) {
      return;
    }
    
    const { error, level, timestamp } = entry;
    const timeStr = timestamp.toLocaleTimeString();
    
    // Determine console method and color
    const consoleMethod = level === LogLevel.ERROR || level === LogLevel.FATAL ? 'error' :
                         level === LogLevel.WARN ? 'warn' :
                         level === LogLevel.INFO ? 'info' : 'log';
    
    const emoji = level === LogLevel.FATAL ? '💀' :
                 level === LogLevel.ERROR ? '❌' :
                 level === LogLevel.WARN ? '⚠️' :
                 level === LogLevel.INFO ? 'ℹ️' : '🐛';
    
    // Log error
    console[consoleMethod](
      `${emoji} [${timeStr}] ${level.toUpperCase()}:`,
      error.message
    );
    
    // Log AppError details
    if (isAppError(error)) {
      console.groupCollapsed('Error Details');
      console.log('User Message:', error.userMessage);
      console.log('Category:', error.category);
      console.log('Severity:', error.severity);
      console.log('Recoverable:', error.recoverable);
      if (error.recoveryHint) {
        console.log('Recovery Hint:', error.recoveryHint);
      }
      if (error.metadata) {
        console.log('Metadata:', error.metadata);
      }
      console.groupEnd();
    }
    
    // Log context
    if (entry.context && Object.keys(entry.context).length > 0) {
      console.groupCollapsed('Context');
      console.log(entry.context);
      console.groupEnd();
    }
    
    // Log stack trace
    if (error.stack) {
      console.groupCollapsed('Stack Trace');
      console.log(error.stack);
      console.groupEnd();
    }
  }
  
  /**
   * Send log to remote endpoint
   */
  private async sendToRemote(entry: ErrorLogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) {
      return;
    }
    
    try {
      // Convert error to serializable format
      const payload = {
        id: entry.id,
        timestamp: entry.timestamp.toISOString(),
        level: entry.level,
        error: {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
          ...(isAppError(entry.error) ? {
            userMessage: entry.error.userMessage,
            category: entry.error.category,
            severity: entry.error.severity,
            metadata: entry.error.metadata
          } : {})
        },
        userId: entry.userId,
        sessionId: entry.sessionId,
        environment: entry.environment,
        context: entry.context
      };
      
      // Send to remote endpoint
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      // Failed to send to remote - log to console only
      console.error('Failed to send error to remote endpoint:', error);
    }
  }
  
  /**
   * Add log entry
   */
  private addLogEntry(entry: ErrorLogEntry): void {
    // Add to logs array
    this.logs.push(entry);
    
    // Trim logs if exceeding max
    if (this.logs.length > this.config.maxLogs!) {
      this.logs = this.logs.slice(-this.config.maxLogs!);
    }
    
    // Log to console
    this.logToConsole(entry);
    
    // Send to remote
    this.sendToRemote(entry).catch(() => {
      // Ignore remote logging errors
    });
  }
  
  /**
   * Log an error
   * 
   * @param {Error | AppError} error - Error to log
   * @param {Record<string, any>} context - Additional context
   * @param {string} userId - User ID
   */
  public logError(
    error: Error | AppError,
    context?: Record<string, any>,
    userId?: string
  ): void {
    const level = isAppError(error) && error.severity === ErrorSeverity.CRITICAL
      ? LogLevel.FATAL
      : LogLevel.ERROR;
    
    const entry = this.createLogEntry(error, level, context);
    if (userId) {
      entry.userId = userId;
    }
    
    this.addLogEntry(entry);
  }
  
  /**
   * Log a warning
   * 
   * @param {string} message - Warning message
   * @param {Record<string, any>} context - Additional context
   */
  public logWarning(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(
      new Error(message),
      LogLevel.WARN,
      context
    );
    this.addLogEntry(entry);
  }
  
  /**
   * Log info message
   * 
   * @param {string} message - Info message
   * @param {Record<string, any>} context - Additional context
   */
  public logInfo(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(
      new Error(message),
      LogLevel.INFO,
      context
    );
    this.addLogEntry(entry);
  }
  
  /**
   * Log debug message
   * 
   * @param {string} message - Debug message
   * @param {Record<string, any>} context - Additional context
   */
  public logDebug(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(
      new Error(message),
      LogLevel.DEBUG,
      context
    );
    this.addLogEntry(entry);
  }
  
  /**
   * Get error statistics
   * 
   * @returns {ErrorStatistics} Error statistics
   */
  public getStatistics(): ErrorStatistics {
    const stats: ErrorStatistics = {
      total: this.logs.length,
      bySeverity: {
        [ErrorSeverity.LOW]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.CRITICAL]: 0
      },
      byCategory: {
        [ErrorCategory.AUTH]: 0,
        [ErrorCategory.NETWORK]: 0,
        [ErrorCategory.VALIDATION]: 0,
        [ErrorCategory.DATABASE]: 0,
        [ErrorCategory.BUSINESS]: 0,
        [ErrorCategory.UI]: 0,
        [ErrorCategory.UNKNOWN]: 0
      },
      recent: this.logs.slice(-10)
    };
    
    // Count by severity and category
    this.logs.forEach(entry => {
      if (isAppError(entry.error)) {
        stats.bySeverity[entry.error.severity]++;
        stats.byCategory[entry.error.category]++;
      }
    });
    
    return stats;
  }
  
  /**
   * Get all logs
   * 
   * @returns {ErrorLogEntry[]} All log entries
   */
  public getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }
  
  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
  }
  
  /**
   * Configure logger
   * 
   * @param {LoggerConfig} config - New configuration
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

// Create default instance
export const errorLogger = ErrorLogger.getInstance({
  enableConsole: import.meta.env.DEV,
  enableRemote: import.meta.env.PROD,
  remoteEndpoint: import.meta.env.VITE_ERROR_REPORTING_ENDPOINT,
  maxLogs: 100,
  minLevel: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN
});

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).errorLogger = errorLogger;
  (window as any).getErrorStats = () => {
    const stats = errorLogger.getStatistics();
    console.log('📊 Error Statistics:');
    console.log(`Total Errors: ${stats.total}`);
    console.log('By Severity:', stats.bySeverity);
    console.log('By Category:', stats.byCategory);
    console.log('Recent Errors:', stats.recent);
    return stats;
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default errorLogger;
