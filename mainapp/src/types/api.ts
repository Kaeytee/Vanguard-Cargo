/**
 * Common API Response Types
 * Simple type definitions for API responses
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Paginated response interface
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
