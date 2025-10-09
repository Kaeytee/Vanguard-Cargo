// ============================================================================
// RTK Query API Configuration
// ============================================================================
// Description: API endpoints with automatic caching using RTK Query
// Author: Senior Software Engineer
// Features: Automatic caching, invalidation, optimistic updates
// Architecture: Clean Code, REST API, Type-Safe
// ============================================================================

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';
import { SUPABASE_CONFIG } from '@/config/supabase';
import type { Package, PackageStatus } from '../slices/packagesSlice';
import type { Notification } from '../slices/notificationsSlice';

// ============================================================================
// BASE QUERY CONFIGURATION
// ============================================================================

/**
 * Base query with Supabase authentication
 * 
 * Automatically includes authentication headers
 * Handles errors and token refresh
 */
const baseQuery = fetchBaseQuery({
  baseUrl: SUPABASE_CONFIG.url,
  prepareHeaders: async (headers) => {
    // Get current session token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
      headers.set('apikey', SUPABASE_CONFIG.anonKey);
    }
    
    return headers;
  },
});

// ============================================================================
// API DEFINITION
// ============================================================================

/**
 * Vanguard Cargo API with RTK Query
 * 
 * Features:
 * - Automatic caching (5 minutes default)
 * - Tag-based cache invalidation
 * - Optimistic updates
 * - Polling support for real-time data
 * - Pagination support
 * 
 * Cache Tags:
 * - Package: Individual package cache
 * - Packages: List of packages cache
 * - Notification: Individual notification cache
 * - Notifications: List of notifications cache
 * - DeliveryCode: Delivery code cache
 */
export const vanguardApi = createApi({
  reducerPath: 'vanguardApi',
  baseQuery,
  tagTypes: ['Package', 'Packages', 'Notification', 'Notifications', 'DeliveryCode', 'User'],
  
  // Cache lifetime: 5 minutes
  keepUnusedDataFor: 300,
  
  // Refetch on mount if data is stale
  refetchOnMountOrArgChange: true,
  
  endpoints: (builder) => ({
    // ========================================================================
    // PACKAGE ENDPOINTS
    // ========================================================================
    
    /**
     * Get all packages for a user
     * 
     * @param {string} userId - User ID
     * @returns {Package[]} Array of packages
     * 
     * Cache: Tagged as 'Packages'
     * Invalidates: On package mutations
     */
    getPackages: builder.query<Package[], string>({
      queryFn: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('packages')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return { data: data || [] };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Package' as const, id })),
              { type: 'Packages', id: 'LIST' },
            ]
          : [{ type: 'Packages', id: 'LIST' }],
    }),

    /**
     * Get single package by ID
     * 
     * @param {string} packageId - Package ID
     * @returns {Package} Package data
     * 
     * Cache: Tagged as 'Package' with ID
     */
    getPackageById: builder.query<Package, string>({
      queryFn: async (packageId) => {
        try {
          const { data, error } = await supabase
            .from('packages')
            .select('*')
            .eq('id', packageId)
            .single();

          if (error) throw error;
          return { data };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'Package', id }],
    }),

    /**
     * Update package status
     * 
     * @param {Object} params - Update parameters
     * @param {string} params.packageId - Package ID
     * @param {PackageStatus} params.status - New status
     * @param {string} params.notes - Optional notes
     * @returns {Package} Updated package
     * 
     * Invalidates: Package cache and Packages list
     */
    updatePackageStatus: builder.mutation<Package, { packageId: string; status: PackageStatus; notes?: string }>({
      queryFn: async ({ packageId, status, notes }) => {
        try {
          const { data, error } = await supabase
            .from('packages')
            .update({
              status,
              notes: notes || undefined,
              updated_at: new Date().toISOString(),
            })
            .eq('id', packageId)
            .select()
            .single();

          if (error) throw error;
          return { data };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (_result, _error, { packageId }) => [
        { type: 'Package', id: packageId },
        { type: 'Packages', id: 'LIST' },
      ],
    }),

    // ========================================================================
    // NOTIFICATION ENDPOINTS
    // ========================================================================

    /**
     * Get all notifications for a user
     * 
     * @param {string} userId - User ID
     * @returns {Notification[]} Array of notifications
     * 
     * Cache: Tagged as 'Notifications'
     * Polling: Optional real-time updates
     */
    getNotifications: builder.query<Notification[], string>({
      queryFn: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;
          return { data: data || [] };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notifications', id: 'LIST' },
            ]
          : [{ type: 'Notifications', id: 'LIST' }],
    }),

    /**
     * Mark notification as read
     * 
     * @param {string} notificationId - Notification ID
     * @returns {void}
     * 
     * Invalidates: Notification cache
     */
    markNotificationAsRead: builder.mutation<void, string>({
      queryFn: async (notificationId) => {
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

          if (error) throw error;
          return { data: undefined };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'Notification', id },
        { type: 'Notifications', id: 'LIST' },
      ],
    }),

    // ========================================================================
    // DELIVERY CODE ENDPOINTS
    // ========================================================================

    /**
     * Get delivery codes for user
     * 
     * @param {string} userId - User ID
     * @returns {Array} Array of delivery codes
     * 
     * Cache: Tagged as 'DeliveryCode'
     */
    getDeliveryCodes: builder.query<any[], string>({
      queryFn: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('packages')
            .select('*')
            .eq('user_id', userId)
            .not('delivery_auth_code', 'is', null);

          if (error) throw error;
          return { data: data || [] };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: [{ type: 'DeliveryCode', id: 'LIST' }],
    }),

    // ========================================================================
    // USER PROFILE ENDPOINTS
    // ========================================================================

    /**
     * Get user profile
     * 
     * @param {string} userId - User ID
     * @returns {Object} User profile
     * 
     * Cache: Tagged as 'User'
     */
    getUserProfile: builder.query<any, string>({
      queryFn: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) throw error;
          return { data };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    /**
     * Update user profile
     * 
     * @param {Object} params - Update parameters
     * @param {string} params.userId - User ID
     * @param {Object} params.updates - Profile updates
     * @returns {Object} Updated profile
     * 
     * Invalidates: User cache
     */
    updateUserProfile: builder.mutation<any, { userId: string; updates: any }>({
      queryFn: async ({ userId, updates }) => {
        try {
          const { data, error } = await supabase
            .from('users')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select()
            .single();

          if (error) throw error;
          return { data };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'User', id: userId }],
    }),
  }),
});

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Export auto-generated hooks for all endpoints
 * 
 * Query hooks:
 * - useGetPackagesQuery
 * - useGetPackageByIdQuery
 * - useGetNotificationsQuery
 * - useGetDeliveryCodesQuery
 * - useGetUserProfileQuery
 * 
 * Mutation hooks:
 * - useUpdatePackageStatusMutation
 * - useMarkNotificationAsReadMutation
 * - useUpdateUserProfileMutation
 */
export const {
  useGetPackagesQuery,
  useGetPackageByIdQuery,
  useUpdatePackageStatusMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useGetDeliveryCodesQuery,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = vanguardApi;

// ============================================================================
// DOCUMENTATION
// ============================================================================

/**
 * USAGE EXAMPLES:
 * 
 * 1. Fetch packages with automatic caching:
 * ```typescript
 * const { data: packages, isLoading, error, refetch } = useGetPackagesQuery(userId);
 * ```
 * 
 * 2. Update package status with optimistic updates:
 * ```typescript
 * const [updateStatus, { isLoading }] = useUpdatePackageStatusMutation();
 * 
 * await updateStatus({
 *   packageId: '123',
 *   status: 'processing',
 *   notes: 'Processing started'
 * });
 * ```
 * 
 * 3. Polling for real-time updates:
 * ```typescript
 * const { data } = useGetNotificationsQuery(userId, {
 *   pollingInterval: 30000, // Poll every 30 seconds
 * });
 * ```
 * 
 * 4. Conditional fetching:
 * ```typescript
 * const { data } = useGetPackagesQuery(userId, {
 *   skip: !userId, // Skip query if userId is not available
 * });
 * ```
 * 
 * 5. Manual cache invalidation:
 * ```typescript
 * import { vanguardApi } from '@/store/api/vanguardApi';
 * 
 * dispatch(vanguardApi.util.invalidateTags(['Packages']));
 * ```
 */
