/**
 * Date Utility Functions
 * 
 * Provides safe date formatting with proper validation
 * for package intake and other components.
 */

/**
 * Format date string for display with validation
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted date string or fallback message
 */
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format time string for display with validation
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted time string or fallback message
 */
export const formatTime = (dateString?: string | null): string => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string for time:', dateString);
      return 'Invalid Time';
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};

/**
 * Check if a date string is valid
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export const isValidDate = (dateString?: string | null): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};
