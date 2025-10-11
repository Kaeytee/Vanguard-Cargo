// ============================================================================
// Tab Sync Manager - Multi-Tab Authentication Synchronization
// ============================================================================
// Description: Synchronizes authentication state across all browser tabs
// Author: Senior Software Engineer
// Security: Ensures consistent auth state in multi-tab scenarios
// Features: BroadcastChannel API with localStorage fallback
// ============================================================================

import { StorageManager } from './storageManager';

/**
 * Tab sync event types
 */
export const TabSyncEventType = {
  /** User logged in */
  LOGIN: 'LOGIN',
  
  /** User logged out */
  LOGOUT: 'LOGOUT',
  
  /** Session updated */
  SESSION_UPDATE: 'SESSION_UPDATE',
  
  /** Token refreshed */
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  
  /** User profile updated */
  PROFILE_UPDATE: 'PROFILE_UPDATE'
} as const;

export type TabSyncEventType = typeof TabSyncEventType[keyof typeof TabSyncEventType];

/**
 * Tab sync message structure
 */
export interface TabSyncMessage {
  /** Event type */
  type: TabSyncEventType;
  
  /** Event timestamp */
  timestamp: number;
  
  /** Event data payload */
  data?: any;
  
  /** Source tab ID (for debugging) */
  tabId: string;
}

/**
 * Tab sync event handler function type
 */
export type TabSyncHandler = (message: TabSyncMessage) => void | Promise<void>;

/**
 * Tab Sync Manager Class
 * 
 * Synchronizes authentication state and other critical data across
 * all browser tabs using BroadcastChannel API (modern browsers) with
 * localStorage event fallback (older browsers).
 * 
 * Features:
 * - Login/logout synchronization across tabs
 * - Session state updates
 * - Token refresh notifications
 * - Profile update notifications
 * - Automatic cleanup on window unload
 * - Unique tab ID tracking
 * - Event handler registration
 * 
 * @class TabSyncManager
 */
export class TabSyncManager {
  private static instance: TabSyncManager | null = null;
  private channel: BroadcastChannel | null = null;
  private tabId: string;
  private handlers: Map<TabSyncEventType, Set<TabSyncHandler>> = new Map();
  private isInitialized: boolean = false;
  private useBroadcastChannel: boolean = false;
  
  /**
   * Private constructor (singleton pattern)
   */
  private constructor() {
    // Generate unique tab ID for tracking
    this.tabId = this.generateTabId();
    
    // Check if BroadcastChannel is supported
    this.useBroadcastChannel = typeof BroadcastChannel !== 'undefined';
    
    console.log('🔄 TabSyncManager created', {
      tabId: this.tabId,
      useBroadcastChannel: this.useBroadcastChannel
    });
  }
  
  /**
   * Get singleton instance
   * 
   * @returns {TabSyncManager} Singleton instance
   */
  public static getInstance(): TabSyncManager {
    if (!TabSyncManager.instance) {
      TabSyncManager.instance = new TabSyncManager();
    }
    return TabSyncManager.instance;
  }
  
  /**
   * Initialize tab synchronization
   * Sets up BroadcastChannel or localStorage listener
   * 
   * @returns {void}
   */
  public initialize(): void {
    if (this.isInitialized) {
      console.warn('⚠️ TabSyncManager already initialized');
      return;
    }
    
    try {
      if (this.useBroadcastChannel) {
        // Use modern BroadcastChannel API
        this.initializeBroadcastChannel();
      } else {
        // Fallback to localStorage events
        this.initializeLocalStorageFallback();
      }
      
      // Set up cleanup on window unload
      window.addEventListener('beforeunload', () => this.cleanup());
      
      this.isInitialized = true;
      console.log('✅ TabSyncManager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize TabSyncManager:', error);
    }
  }
  
  /**
   * Initialize BroadcastChannel (modern browsers)
   * 
   * @private
   * @returns {void}
   */
  private initializeBroadcastChannel(): void {
    // Create broadcast channel
    this.channel = new BroadcastChannel('vanguard-cargo-auth-sync');
    
    // Listen for messages
    this.channel.addEventListener('message', (event: MessageEvent) => {
      this.handleMessage(event.data);
    });
    
    console.log('📡 BroadcastChannel initialized');
  }
  
  /**
   * Initialize localStorage fallback (older browsers)
   * 
   * @private
   * @returns {void}
   */
  private initializeLocalStorageFallback(): void {
    // Listen for localStorage changes from other tabs
    window.addEventListener('storage', (event: StorageEvent) => {
      // Only process our sync events
      if (event.key === 'tab_sync_event' && event.newValue) {
        try {
          const message: TabSyncMessage = JSON.parse(event.newValue);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing tab sync message:', error);
        }
      }
    });
    
    console.log('📡 localStorage fallback initialized');
  }
  
  /**
   * Handle incoming sync message
   * 
   * @private
   * @param {TabSyncMessage} message - Sync message
   * @returns {void}
   */
  private handleMessage(message: TabSyncMessage): void {
    // Ignore messages from this tab
    if (message.tabId === this.tabId) {
      return;
    }
    
    console.log('📨 Tab sync message received:', {
      type: message.type,
      fromTab: message.tabId,
      timestamp: new Date(message.timestamp).toISOString()
    });
    
    // Execute registered handlers for this event type
    const handlers = this.handlers.get(message.type);
    if (handlers && handlers.size > 0) {
      handlers.forEach(async (handler) => {
        try {
          await handler(message);
        } catch (error) {
          console.error(`Error in tab sync handler for ${message.type}:`, error);
        }
      });
    }
  }
  
  /**
   * Broadcast message to all other tabs
   * 
   * @param {TabSyncEventType} type - Event type
   * @param {any} data - Event data
   * @returns {void}
   */
  public broadcast(type: TabSyncEventType, data?: any): void {
    const message: TabSyncMessage = {
      type,
      timestamp: Date.now(),
      data,
      tabId: this.tabId
    };
    
    try {
      if (this.useBroadcastChannel && this.channel) {
        // Use BroadcastChannel
        this.channel.postMessage(message);
        console.log(`📤 Broadcasted ${type} via BroadcastChannel`);
      } else {
        // Use localStorage fallback
        StorageManager.safeSetItem('tab_sync_event', JSON.stringify(message));
        
        // Clear after short delay (allows other tabs to read it)
        setTimeout(() => {
          localStorage.removeItem('tab_sync_event');
        }, 100);
        
        console.log(`📤 Broadcasted ${type} via localStorage`);
      }
    } catch (error) {
      console.error(`Failed to broadcast ${type}:`, error);
    }
  }
  
  /**
   * Register event handler for specific event type
   * 
   * @param {TabSyncEventType} type - Event type to listen for
   * @param {TabSyncHandler} handler - Handler function
   * @returns {void}
   */
  public on(type: TabSyncEventType, handler: TabSyncHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    this.handlers.get(type)!.add(handler);
    console.log(`✅ Registered handler for ${type}`);
  }
  
  /**
   * Unregister event handler
   * 
   * @param {TabSyncEventType} type - Event type
   * @param {TabSyncHandler} handler - Handler function to remove
   * @returns {void}
   */
  public off(type: TabSyncEventType, handler: TabSyncHandler): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      console.log(`✅ Unregistered handler for ${type}`);
    }
  }
  
  /**
   * Remove all handlers for a specific event type
   * 
   * @param {TabSyncEventType} type - Event type
   * @returns {void}
   */
  public removeAllHandlers(type: TabSyncEventType): void {
    this.handlers.delete(type);
    console.log(`✅ Removed all handlers for ${type}`);
  }
  
  /**
   * Generate unique tab ID
   * 
   * @private
   * @returns {string} Unique tab ID
   */
  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * Get current tab ID
   * 
   * @returns {string} Tab ID
   */
  public getTabId(): string {
    return this.tabId;
  }
  
  /**
   * Check if tab sync is initialized
   * 
   * @returns {boolean} Initialization status
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Get statistics about registered handlers
   * 
   * @returns {Object} Handler statistics
   */
  public getStatistics(): {
    totalHandlers: number;
    handlersByType: Record<string, number>;
    useBroadcastChannel: boolean;
    tabId: string;
  } {
    const handlersByType: Record<string, number> = {};
    
    this.handlers.forEach((handlers, type) => {
      handlersByType[type] = handlers.size;
    });
    
    return {
      totalHandlers: Array.from(this.handlers.values())
        .reduce((sum, handlers) => sum + handlers.size, 0),
      handlersByType,
      useBroadcastChannel: this.useBroadcastChannel,
      tabId: this.tabId
    };
  }
  
  /**
   * Clean up resources
   * 
   * @returns {void}
   */
  public cleanup(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    
    this.handlers.clear();
    this.isInitialized = false;
    
    console.log('🧹 TabSyncManager cleaned up');
  }
  
  /**
   * Reset singleton instance (for testing)
   * 
   * @returns {void}
   */
  public static reset(): void {
    if (TabSyncManager.instance) {
      TabSyncManager.instance.cleanup();
      TabSyncManager.instance = null;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE EXPORT
// ============================================================================

/**
 * Global tab sync manager instance
 */
export const tabSyncManager = TabSyncManager.getInstance();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).tabSyncManager = tabSyncManager;
  
  // Debug command to check status
  (window as any).checkTabSync = () => {
    console.log('Tab Sync Status:', tabSyncManager.getStatistics());
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Broadcast login event to all tabs
 * 
 * @param {any} user - User data
 * @returns {void}
 */
export function broadcastLogin(user: any): void {
  tabSyncManager.broadcast(TabSyncEventType.LOGIN, { user });
}

/**
 * Broadcast logout event to all tabs
 * 
 * @returns {void}
 */
export function broadcastLogout(): void {
  tabSyncManager.broadcast(TabSyncEventType.LOGOUT);
}

/**
 * Broadcast session update to all tabs
 * 
 * @param {any} session - Session data
 * @returns {void}
 */
export function broadcastSessionUpdate(session: any): void {
  tabSyncManager.broadcast(TabSyncEventType.SESSION_UPDATE, { session });
}

/**
 * Broadcast token refresh to all tabs
 * 
 * @param {string} token - New access token
 * @returns {void}
 */
export function broadcastTokenRefresh(token: string): void {
  tabSyncManager.broadcast(TabSyncEventType.TOKEN_REFRESH, { token });
}

/**
 * Broadcast profile update to all tabs
 * 
 * @param {any} profile - Updated profile data
 * @returns {void}
 */
export function broadcastProfileUpdate(profile: any): void {
  tabSyncManager.broadcast(TabSyncEventType.PROFILE_UPDATE, { profile });
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Initialize tab sync on app startup
 * 
 * ```typescript
 * import { tabSyncManager } from '@/utils/tabSyncManager';
 * 
 * // In your App.tsx or main.tsx
 * useEffect(() => {
 *   tabSyncManager.initialize();
 * }, []);
 * ```
 * 
 * EXAMPLE 2: Listen for logout events
 * 
 * ```typescript
 * import { tabSyncManager, TabSyncEventType } from '@/utils/tabSyncManager';
 * 
 * useEffect(() => {
 *   const handleLogout = () => {
 *     console.log('Logout detected in another tab!');
 *     // Perform logout in this tab too
 *     dispatch(logoutUser());
 *   };
 *   
 *   tabSyncManager.on(TabSyncEventType.LOGOUT, handleLogout);
 *   
 *   return () => {
 *     tabSyncManager.off(TabSyncEventType.LOGOUT, handleLogout);
 *   };
 * }, []);
 * ```
 * 
 * EXAMPLE 3: Broadcast logout to all tabs
 * 
 * ```typescript
 * import { broadcastLogout } from '@/utils/tabSyncManager';
 * 
 * const handleLogout = async () => {
 *   await authService.logout();
 *   broadcastLogout(); // Notify all other tabs
 *   navigate('/login');
 * };
 * ```
 * 
 * EXAMPLE 4: Listen for login events
 * 
 * ```typescript
 * tabSyncManager.on(TabSyncEventType.LOGIN, (message) => {
 *   console.log('User logged in from another tab:', message.data.user);
 *   // Update Redux state
 *   dispatch(setUser(message.data.user));
 * });
 * ```
 */
