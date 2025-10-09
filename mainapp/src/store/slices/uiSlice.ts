// ============================================================================
// UI Redux Slice
// ============================================================================
// Description: UI state management (modals, sidebars, themes, loading states)
// Author: Senior Software Engineer
// Features: Global UI state, theme management, component visibility
// Architecture: Clean Code, OOP Principles, Type-Safe
// ============================================================================

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Theme type
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Sidebar state
 */
export type SidebarState = 'open' | 'closed' | 'collapsed';

/**
 * Modal types
 */
export type ModalType =
  | 'package-edit'
  | 'package-details'
  | 'shipment-create'
  | 'profile-edit'
  | 'settings'
  | 'confirmation'
  | null;

/**
 * Toast notification interface
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

/**
 * UI state shape
 */
interface UIState {
  theme: Theme;
  sidebar: SidebarState;
  isMobileMenuOpen: boolean;
  activeModal: ModalType;
  modalData: any;
  toasts: Toast[];
  isGlobalLoading: boolean;
  loadingMessage: string | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: UIState = {
  theme: 'light',
  sidebar: 'open',
  isMobileMenuOpen: false,
  activeModal: null,
  modalData: null,
  toasts: [],
  isGlobalLoading: false,
  loadingMessage: null,
};

// ============================================================================
// SLICE DEFINITION
// ============================================================================

/**
 * UI slice with reducers for managing global UI state
 * 
 * Manages:
 * - Theme (light/dark mode)
 * - Sidebar state (open/closed/collapsed)
 * - Modal management
 * - Toast notifications
 * - Global loading states
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * Set theme
     * 
     * @param {Theme} theme - Theme to set
     */
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      // Persist theme to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('vanguard-cargo-theme', action.payload);
      }
    },

    /**
     * Toggle theme between light and dark
     */
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      // Persist theme to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('vanguard-cargo-theme', state.theme);
      }
    },

    /**
     * Set sidebar state
     * 
     * @param {SidebarState} sidebarState - Sidebar state
     */
    setSidebar: (state, action: PayloadAction<SidebarState>) => {
      state.sidebar = action.payload;
    },

    /**
     * Toggle sidebar between open and closed
     */
    toggleSidebar: (state) => {
      state.sidebar = state.sidebar === 'open' ? 'closed' : 'open';
    },

    /**
     * Collapse sidebar
     */
    collapseSidebar: (state) => {
      state.sidebar = 'collapsed';
    },

    /**
     * Open mobile menu
     */
    openMobileMenu: (state) => {
      state.isMobileMenuOpen = true;
    },

    /**
     * Close mobile menu
     */
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },

    /**
     * Open modal
     * 
     * @param {Object} payload - Modal configuration
     * @param {ModalType} payload.type - Modal type
     * @param {any} payload.data - Modal data
     */
    openModal: (state, action: PayloadAction<{ type: ModalType; data?: any }>) => {
      state.activeModal = action.payload.type;
      state.modalData = action.payload.data || null;
    },

    /**
     * Close active modal
     */
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },

    /**
     * Show toast notification
     * 
     * @param {Toast} toast - Toast notification
     */
    showToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const toast: Toast = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        duration: action.payload.duration || 5000,
      };
      state.toasts.push(toast);
    },

    /**
     * Remove toast notification
     * 
     * @param {string} toastId - Toast ID to remove
     */
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },

    /**
     * Clear all toasts
     */
    clearToasts: (state) => {
      state.toasts = [];
    },

    /**
     * Set global loading state
     * 
     * @param {Object} payload - Loading configuration
     * @param {boolean} payload.isLoading - Loading state
     * @param {string} payload.message - Optional loading message
     */
    setGlobalLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.isGlobalLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || null;
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

// Export actions
export const {
  setTheme,
  toggleTheme,
  setSidebar,
  toggleSidebar,
  collapseSidebar,
  openMobileMenu,
  closeMobileMenu,
  toggleMobileMenu,
  openModal,
  closeModal,
  showToast,
  removeToast,
  clearToasts,
  setGlobalLoading,
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer;

// Export selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSidebar = (state: { ui: UIState }) => state.ui.sidebar;
export const selectIsMobileMenuOpen = (state: { ui: UIState }) => state.ui.isMobileMenuOpen;
export const selectActiveModal = (state: { ui: UIState }) => state.ui.activeModal;
export const selectModalData = (state: { ui: UIState }) => state.ui.modalData;
export const selectToasts = (state: { ui: UIState }) => state.ui.toasts;
export const selectIsGlobalLoading = (state: { ui: UIState }) => state.ui.isGlobalLoading;
export const selectLoadingMessage = (state: { ui: UIState }) => state.ui.loadingMessage;

// ============================================================================
// DOCUMENTATION
// ============================================================================

/**
 * USAGE EXAMPLES:
 * 
 * 1. Toggle theme:
 * ```typescript
 * const dispatch = useAppDispatch();
 * dispatch(toggleTheme());
 * ```
 * 
 * 2. Show toast:
 * ```typescript
 * dispatch(showToast({
 *   type: 'success',
 *   message: 'Package updated successfully',
 *   duration: 3000
 * }));
 * ```
 * 
 * 3. Open modal:
 * ```typescript
 * dispatch(openModal({
 *   type: 'package-edit',
 *   data: { packageId: '123' }
 * }));
 * ```
 * 
 * 4. Set global loading:
 * ```typescript
 * dispatch(setGlobalLoading({
 *   isLoading: true,
 *   message: 'Processing...'
 * }));
 * ```
 */
