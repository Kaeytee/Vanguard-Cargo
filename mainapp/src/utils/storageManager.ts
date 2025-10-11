// ============================================================================
// Storage Manager - localStorage Quota Management
// ============================================================================
// Description: Monitors and manages localStorage usage to prevent crashes
// Author: Senior Software Engineer
// Features: Quota monitoring, automatic cleanup, error handling
// Security: Prevents QuotaExceededError, manages data rotation
// ============================================================================

/**
 * Storage usage information
 */
export interface StorageUsage {
  /** Current storage used in bytes */
  used: number;
  
  /** Estimated available storage in bytes */
  available: number;
  
  /** Usage percentage (0-100) */
  percentage: number;
  
  /** Human-readable used size */
  usedFormatted: string;
  
  /** Human-readable available size */
  availableFormatted: string;
  
  /** Warning level: 'safe' | 'warning' | 'critical' | 'danger' */
  level: 'safe' | 'warning' | 'critical' | 'danger';
}

/**
 * Storage Manager Class
 * 
 * Manages localStorage quota to prevent QuotaExceededError
 * Features:
 * - Real-time usage monitoring
 * - Automatic cleanup when quota approached
 * - Data rotation for old entries
 * - Safe error handling
 * - Human-readable size formatting
 * 
 * @class StorageManager
 */
export class StorageManager {
  // Most browsers have 5-10MB limit for localStorage
  private static readonly DEFAULT_QUOTA = 10 * 1024 * 1024; // 10MB
  
  // Warning thresholds
  private static readonly WARNING_THRESHOLD = 0.8; // 80%
  private static readonly CRITICAL_THRESHOLD = 0.9; // 90%
  private static readonly DANGER_THRESHOLD = 0.95; // 95%
  
  // Maximum items to keep
  private static readonly MAX_NOTIFICATIONS = 50;
  private static readonly MAX_SEARCH_HISTORY = 20;
  
  /**
   * Get current localStorage usage
   * 
   * @returns {StorageUsage} Current storage usage information
   */
  public static getUsage(): StorageUsage {
    let totalBytes = 0;
    
    try {
      // Calculate total size of all localStorage items
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          // Each character is 2 bytes in UTF-16
          const itemSize = (localStorage[key].length + key.length) * 2;
          totalBytes += itemSize;
        }
      }
    } catch (error) {
      console.error('Error calculating storage usage:', error);
    }
    
    const available = this.DEFAULT_QUOTA;
    const percentage = (totalBytes / available) * 100;
    
    // Determine warning level
    let level: 'safe' | 'warning' | 'critical' | 'danger' = 'safe';
    const ratio = totalBytes / available;
    
    if (ratio >= this.DANGER_THRESHOLD) {
      level = 'danger';
    } else if (ratio >= this.CRITICAL_THRESHOLD) {
      level = 'critical';
    } else if (ratio >= this.WARNING_THRESHOLD) {
      level = 'warning';
    }
    
    return {
      used: totalBytes,
      available,
      percentage: Math.min(percentage, 100),
      usedFormatted: this.formatBytes(totalBytes),
      availableFormatted: this.formatBytes(available),
      level
    };
  }
  
  /**
   * Format bytes to human-readable string
   * 
   * @param {number} bytes - Bytes to format
   * @returns {string} Formatted string (e.g., "2.5 MB")
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
  
  /**
   * Check if storage is approaching quota
   * 
   * @returns {boolean} True if storage is at warning level or higher
   */
  public static isApproachingQuota(): boolean {
    const usage = this.getUsage();
    return usage.level !== 'safe';
  }
  
  /**
   * Automatic cleanup when storage quota is approached
   * Removes old notifications and search history
   * 
   * @returns {number} Number of bytes freed
   */
  public static cleanup(): number {
    console.log('🧹 Starting automatic storage cleanup...');
    
    const beforeUsage = this.getUsage();
    let cleanedItems = 0;
    
    try {
      // 1. Clean old notifications (keep only last 50)
      cleanedItems += this.cleanNotifications();
      
      // 2. Clean search history (keep only last 20)
      cleanedItems += this.cleanSearchHistory();
      
      // 3. Remove any temporary data older than 7 days
      cleanedItems += this.cleanTemporaryData();
      
      const afterUsage = this.getUsage();
      const bytesFreed = beforeUsage.used - afterUsage.used;
      
      console.log(`✅ Cleanup complete:`, {
        before: beforeUsage.usedFormatted,
        after: afterUsage.usedFormatted,
        freed: this.formatBytes(bytesFreed),
        itemsCleaned: cleanedItems
      });
      
      return bytesFreed;
    } catch (error) {
      console.error('Error during cleanup:', error);
      return 0;
    }
  }
  
  /**
   * Clean old notifications, keep only MAX_NOTIFICATIONS most recent
   * 
   * @private
   * @returns {number} Number of items cleaned
   */
  private static cleanNotifications(): number {
    try {
      const stored = localStorage.getItem('package_notifications');
      if (!stored) return 0;
      
      const notifications = JSON.parse(stored);
      if (!Array.isArray(notifications)) return 0;
      
      const originalCount = notifications.length;
      
      if (originalCount > this.MAX_NOTIFICATIONS) {
        // Sort by timestamp (newest first) and keep only MAX_NOTIFICATIONS
        const sorted = notifications.sort((a: any, b: any) => {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          return timeB - timeA;
        });
        
        const trimmed = sorted.slice(0, this.MAX_NOTIFICATIONS);
        localStorage.setItem('package_notifications', JSON.stringify(trimmed));
        
        const removed = originalCount - trimmed.length;
        console.log(`  📋 Notifications: Removed ${removed} old items (kept ${trimmed.length})`);
        return removed;
      }
      
      return 0;
    } catch (error) {
      console.error('Error cleaning notifications:', error);
      return 0;
    }
  }
  
  /**
   * Clean old search history, keep only MAX_SEARCH_HISTORY most recent
   * 
   * @private
   * @returns {number} Number of items cleaned
   */
  private static cleanSearchHistory(): number {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (!stored) return 0;
      
      const searches = JSON.parse(stored);
      if (!Array.isArray(searches)) return 0;
      
      const originalCount = searches.length;
      
      if (originalCount > this.MAX_SEARCH_HISTORY) {
        // Keep only last MAX_SEARCH_HISTORY
        const trimmed = searches.slice(-this.MAX_SEARCH_HISTORY);
        localStorage.setItem('recentSearches', JSON.stringify(trimmed));
        
        const removed = originalCount - trimmed.length;
        console.log(`  🔍 Search History: Removed ${removed} old items (kept ${trimmed.length})`);
        return removed;
      }
      
      return 0;
    } catch (error) {
      console.error('Error cleaning search history:', error);
      return 0;
    }
  }
  
  /**
   * Remove temporary data older than 7 days
   * 
   * @private
   * @returns {number} Number of items cleaned
   */
  private static cleanTemporaryData(): number {
    let cleaned = 0;
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    try {
      // Look for keys that might contain timestamps
      const tempKeys = ['temp_', 'cache_', 'tmp_'];
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          // Check if key suggests temporary data
          const isTemp = tempKeys.some(prefix => key.startsWith(prefix));
          
          if (isTemp) {
            try {
              const data = JSON.parse(localStorage[key]);
              const timestamp = data.timestamp || data.created_at || data.createdAt;
              
              if (timestamp && new Date(timestamp).getTime() < sevenDaysAgo) {
                localStorage.removeItem(key);
                cleaned++;
              }
            } catch {
              // Not JSON or no timestamp, skip
            }
          }
        }
      }
      
      if (cleaned > 0) {
        console.log(`  🗑️ Temporary Data: Removed ${cleaned} old items`);
      }
    } catch (error) {
      console.error('Error cleaning temporary data:', error);
    }
    
    return cleaned;
  }
  
  /**
   * Safe set item - Automatically handles QuotaExceededError
   * 
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {boolean} True if successful, false if failed
   */
  public static safeSetItem(key: string, value: string): boolean {
    try {
      // Check if we're approaching quota before setting
      const usage = this.getUsage();
      
      if (usage.percentage >= 90) {
        console.warn('⚠️ Storage quota at 90%, running cleanup...');
        this.cleanup();
      }
      
      // Try to set the item
      localStorage.setItem(key, value);
      return true;
      
    } catch (error: any) {
      // Handle QuotaExceededError
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.error('❌ localStorage quota exceeded, attempting cleanup...');
        
        // Run aggressive cleanup
        this.cleanup();
        
        try {
          // Try again after cleanup
          localStorage.setItem(key, value);
          console.log('✅ Successfully stored after cleanup');
          return true;
        } catch (retryError) {
          console.error('❌ Still failed after cleanup:', retryError);
          
          // Last resort: Remove oldest non-critical data
          this.emergencyCleanup();
          
          try {
            localStorage.setItem(key, value);
            console.log('✅ Successfully stored after emergency cleanup');
            return true;
          } catch (finalError) {
            console.error('❌ Final attempt failed:', finalError);
            return false;
          }
        }
      }
      
      console.error('Error setting localStorage item:', error);
      return false;
    }
  }
  
  /**
   * Emergency cleanup - Remove non-essential data
   * Only called when regular cleanup fails
   * 
   * @private
   */
  private static emergencyCleanup(): void {
    console.warn('🚨 EMERGENCY CLEANUP - Removing non-essential data...');
    
    try {
      // Keep only last 10 notifications
      const stored = localStorage.getItem('package_notifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        if (Array.isArray(notifications) && notifications.length > 10) {
          const trimmed = notifications.slice(-10);
          localStorage.setItem('package_notifications', JSON.stringify(trimmed));
          console.log('  📋 Notifications reduced to 10');
        }
      }
      
      // Remove all search history
      localStorage.removeItem('recentSearches');
      console.log('  🔍 Search history cleared');
      
      // Remove any cache entries
      for (let key in localStorage) {
        if (key.startsWith('cache_') || key.startsWith('tmp_')) {
          localStorage.removeItem(key);
        }
      }
      console.log('  🗑️ All cache cleared');
      
    } catch (error) {
      console.error('Error in emergency cleanup:', error);
    }
  }
  
  /**
   * Get storage usage report for monitoring
   * 
   * @returns {string} Formatted usage report
   */
  public static getUsageReport(): string {
    const usage = this.getUsage();
    
    const levelEmoji = {
      safe: '✅',
      warning: '⚠️',
      critical: '🔶',
      danger: '🚨'
    };
    
    return `
${levelEmoji[usage.level]} Storage Usage Report
━━━━━━━━━━━━━━━━━━━━━━━━━
Used: ${usage.usedFormatted} / ${usage.availableFormatted}
Percentage: ${usage.percentage.toFixed(1)}%
Level: ${usage.level.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }
  
  /**
   * Monitor storage and auto-cleanup if needed
   * Call this periodically (e.g., on app initialization)
   */
  public static monitor(): void {
    const usage = this.getUsage();
    
    console.log(this.getUsageReport());
    
    // Auto-cleanup if critical or danger
    if (usage.level === 'critical' || usage.level === 'danger') {
      console.warn('🧹 Storage usage high, running automatic cleanup...');
      this.cleanup();
    } else if (usage.level === 'warning') {
      console.warn('⚠️ Storage usage approaching limit (80%+)');
    }
  }
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).storageManager = StorageManager;
  (window as any).checkStorage = () => {
    console.log(StorageManager.getUsageReport());
  };
  (window as any).cleanupStorage = () => {
    StorageManager.cleanup();
  };
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Check storage usage
 * 
 * ```typescript
 * import { StorageManager } from '@/utils/storageManager';
 * 
 * const usage = StorageManager.getUsage();
 * console.log(`Storage: ${usage.usedFormatted} / ${usage.availableFormatted}`);
 * console.log(`Level: ${usage.level}`);
 * ```
 * 
 * EXAMPLE 2: Safe localStorage set
 * 
 * ```typescript
 * const success = StorageManager.safeSetItem('myKey', JSON.stringify(data));
 * if (!success) {
 *   alert('Failed to save data - storage full');
 * }
 * ```
 * 
 * EXAMPLE 3: Manual cleanup
 * 
 * ```typescript
 * const bytesFreed = StorageManager.cleanup();
 * console.log(`Freed ${bytesFreed} bytes`);
 * ```
 * 
 * EXAMPLE 4: Monitor on app start
 * 
 * ```typescript
 * // In main.tsx or App.tsx
 * useEffect(() => {
 *   StorageManager.monitor();
 * }, []);
 * ```
 */
