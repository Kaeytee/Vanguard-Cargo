// ============================================================================
// Notifications Redux Slice
// ============================================================================
// Description: Notifications state management with Redux Toolkit
// Author: Senior Software Engineer
// Features: In-app notifications, real-time updates, read/unread status
// Architecture: Clean Code, OOP Principles, Type-Safe
// ============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import type { RootState } from '../store';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Notification type
 */
export type NotificationType = 'package_update' | 'shipment_update' | 'system' | 'promotion';

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

/**
 * Notifications state shape
 */
interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  lastFetch: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetch user notifications
 * 
 * @param {string} userId - User ID to fetch notifications for
 * @returns {Promise<Notification[]>} Array of notifications
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

/**
 * Mark notification as read
 * 
 * @param {string} notificationId - Notification ID to mark as read
 * @returns {Promise<string>} Updated notification ID
 */
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

/**
 * Mark all notifications as read
 * 
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all notifications as read');
    }
  }
);

// ============================================================================
// SLICE DEFINITION
// ============================================================================

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Add new notification (for real-time updates)
     */
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },

    /**
     * Clear all notifications
     */
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter(n => !n.is_read).length;
        state.lastFetch = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark as read
    builder
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.items.find(n => n.id === action.payload);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    // Mark all as read
    builder
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(n => {
          n.is_read = true;
        });
        state.unreadCount = 0;
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const { addNotification, clearNotifications, clearError } = notificationsSlice.actions;
export default notificationsSlice.reducer;

// Selectors
export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;
export const selectUnreadNotifications = (state: RootState) =>
  state.notifications.items.filter(n => !n.is_read);
export const selectIsLoading = (state: RootState) => state.notifications.isLoading;
