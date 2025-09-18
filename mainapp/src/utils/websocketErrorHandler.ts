/**
 * WebSocket Error Handler for Cloudflare Cookie Issues
 * Handles __cf_bm cookie rejection errors and provides fallback mechanisms
 */

export class WebSocketErrorHandler {
  private static instance: WebSocketErrorHandler;
  private errorCount = 0;
  private maxErrors = 5;
  private suppressErrors = false;

  static getInstance(): WebSocketErrorHandler {
    if (!WebSocketErrorHandler.instance) {
      WebSocketErrorHandler.instance = new WebSocketErrorHandler();
    }
    return WebSocketErrorHandler.instance;
  }

  /**
   * Handle websocket connection errors, particularly Cloudflare cookie issues
   */
  handleWebSocketError(error: unknown): void {
    this.errorCount++;

    // Check if it's a Cloudflare cookie error
    if (this.isCloudflareError(error)) {
      if (!this.suppressErrors) {
        console.warn(
          '🔧 WebSocket connection blocked by Cloudflare bot protection. ' +
          'This is expected in development mode. ' +
          'Real-time features will be limited but core functionality remains available.'
        );
        
        // Suppress further similar errors for this session
        if (this.errorCount >= 3) {
          this.suppressErrors = true;
          console.info('🔇 Suppressing further websocket warnings for this session.');
        }
      }
      return;
    }

    // Handle other websocket errors
    if (this.errorCount <= this.maxErrors) {
      console.warn('WebSocket connection error:', error);
    }
  }

  /**
   * Check if the error is related to Cloudflare's __cf_bm cookie
   */
  private isCloudflareError(error: unknown): boolean {
    const errorStr = String(error).toLowerCase();
    return (
      errorStr.includes('__cf_bm') ||
      errorStr.includes('invalid domain') ||
      errorStr.includes('cookie') && errorStr.includes('rejected')
    );
  }

  /**
   * Reset error tracking for new session
   */
  reset(): void {
    this.errorCount = 0;
    this.suppressErrors = false;
  }

  /**
   * Get current error state
   */
  getErrorState(): { errorCount: number; suppressErrors: boolean } {
    return {
      errorCount: this.errorCount,
      suppressErrors: this.suppressErrors,
    };
  }
}

/**
 * Global websocket error handler for catching unhandled websocket errors
 */
export const setupGlobalWebSocketErrorHandler = (): void => {
  const handler = WebSocketErrorHandler.getInstance();

  // Override console.error to catch websocket-related errors
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const errorMessage = args.join(' ').toLowerCase();
    
    if (errorMessage.includes('websocket') || errorMessage.includes('__cf_bm')) {
      handler.handleWebSocketError(args.join(' '));
      return; // Don't log to console if it's a known websocket issue
    }
    
    // Call original console.error for other errors
    originalConsoleError.apply(console, args);
  };

  // Listen for unhandled promise rejections that might be websocket-related
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error && typeof error === 'object') {
      const errorStr = String(error).toLowerCase();
      if (errorStr.includes('websocket') || errorStr.includes('__cf_bm')) {
        handler.handleWebSocketError(error);
        event.preventDefault(); // Prevent the error from being logged
      }
    }
  });
};

export default WebSocketErrorHandler;
