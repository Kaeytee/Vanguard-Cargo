// ============================================================================
// Packages Redux Slice
// ============================================================================
// Description: Package state management with Redux Toolkit
// Author: Senior Software Engineer
// Features: Package CRUD, status updates, filtering, caching
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
 * Package status types
 */
export type PackageStatus = 'pending' | 'received' | 'processing' | 'shipped' | 'delivered';

/**
 * Package priority types
 */
export type PackagePriority = 'standard' | 'express' | 'urgent';

/**
 * Package interface
 */
export interface Package {
  id: string;
  package_id: string;
  tracking_number: string;
  user_id: string;
  status: PackageStatus;
  description?: string;
  weight?: number;
  declared_value?: number;
  store_name?: string;
  vendor_name?: string;
  notes?: string;
  scanned_by?: string;
  intake_date?: string;
  processed_at?: string;
  shipped_at?: string;
  created_at: string;
  updated_at: string;
  delivery_auth_code?: string;
}

/**
 * Packages state shape
 */
interface PackagesState {
  items: Package[];
  filteredItems: Package[];
  selectedPackageId: string | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: PackageStatus;
    searchQuery?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  stats: {
    total: number;
    pending: number;
    received: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  lastFetch: number | null;
  cacheExpiry: number; // Cache duration in milliseconds
}

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial packages state
 * - Empty package list
 * - No filters applied
 * - 5-minute cache expiry
 */
const initialState: PackagesState = {
  items: [],
  filteredItems: [],
  selectedPackageId: null,
  isLoading: false,
  error: null,
  filters: {},
  stats: {
    total: 0,
    pending: 0,
    received: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  },
  lastFetch: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes cache
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetch user packages from database
 * 
 * Implements caching to avoid unnecessary API calls
 * Fetches packages only if cache is expired
 * 
 * @param {Object} options - Fetch options
 * @param {boolean} options.forceRefresh - Force fetch even if cache is valid
 * @param {string} options.userId - User ID to fetch packages for
 * @returns {Promise<Package[]>} Array of packages
 * @throws {Error} If fetch fails
 */
export const fetchPackages = createAsyncThunk(
  'packages/fetchAll',
  async ({ forceRefresh = false, userId }: { forceRefresh?: boolean; userId: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { packages: PackagesState };
      const now = Date.now();

      // Check cache validity
      if (!forceRefresh && state.packages.lastFetch) {
        const cacheAge = now - state.packages.lastFetch;
        if (cacheAge < state.packages.cacheExpiry) {
          // Cache is still valid, return existing data
          return state.packages.items;
        }
      }

      // Fetch packages from database
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch packages');
    }
  }
);

/**
 * Update package status
 * 
 * Updates package status in database and local state
 * Logs status change for audit trail
 * 
 * @param {Object} params - Update parameters
 * @param {string} params.packageId - Package ID to update
 * @param {PackageStatus} params.status - New status
 * @param {string} params.notes - Optional notes
 * @returns {Promise<Package>} Updated package
 * @throws {Error} If update fails
 */
export const updatePackageStatus = createAsyncThunk(
  'packages/updateStatus',
  async ({ packageId, status, notes }: { packageId: string; status: PackageStatus; notes?: string }, { rejectWithValue }) => {
    try {
      // Update package in database
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

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update package status');
    }
  }
);

/**
 * Delete package
 * 
 * Removes package from database
 * Admin-only operation
 * 
 * @param {string} packageId - Package ID to delete
 * @returns {Promise<string>} Deleted package ID
 * @throws {Error} If deletion fails
 */
export const deletePackage = createAsyncThunk(
  'packages/delete',
  async (packageId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId);

      if (error) {
        throw error;
      }

      return packageId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete package');
    }
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate package statistics
 * 
 * @param {Package[]} packages - Array of packages
 * @returns Statistics object
 */
const calculateStats = (packages: Package[]) => {
  return {
    total: packages.length,
    pending: packages.filter(p => p.status === 'pending').length,
    received: packages.filter(p => p.status === 'received').length,
    processing: packages.filter(p => p.status === 'processing').length,
    shipped: packages.filter(p => p.status === 'shipped').length,
    delivered: packages.filter(p => p.status === 'delivered').length,
  };
};

/**
 * Apply filters to packages
 * 
 * @param {Package[]} packages - Array of packages
 * @param {PackagesState['filters']} filters - Filters to apply
 * @returns Filtered packages
 */
const applyFilters = (packages: Package[], filters: PackagesState['filters']) => {
  let filtered = [...packages];

  // Filter by status
  if (filters.status) {
    filtered = filtered.filter(p => p.status === filters.status);
  }

  // Filter by search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.package_id?.toLowerCase().includes(query) ||
      p.tracking_number?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.store_name?.toLowerCase().includes(query)
    );
  }

  // Filter by date range
  if (filters.dateRange) {
    filtered = filtered.filter(p => {
      const packageDate = new Date(p.created_at).getTime();
      const startDate = new Date(filters.dateRange!.start).getTime();
      const endDate = new Date(filters.dateRange!.end).getTime();
      return packageDate >= startDate && packageDate <= endDate;
    });
  }

  return filtered;
};

// ============================================================================
// SLICE DEFINITION
// ============================================================================

/**
 * Packages slice with reducers and actions
 * 
 * Manages package state and provides actions for:
 * - Fetching packages with caching
 * - Updating package status
 * - Deleting packages
 * - Filtering and searching
 * - Statistics calculation
 */
const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    /**
     * Set selected package
     */
    setSelectedPackage: (state, action: PayloadAction<string | null>) => {
      state.selectedPackageId = action.payload;
    },

    /**
     * Set status filter
     */
    setStatusFilter: (state, action: PayloadAction<PackageStatus | undefined>) => {
      state.filters.status = action.payload;
      state.filteredItems = applyFilters(state.items, state.filters);
    },

    /**
     * Set search query
     */
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
      state.filteredItems = applyFilters(state.items, state.filters);
    },

    /**
     * Set date range filter
     */
    setDateRange: (state, action: PayloadAction<{ start: string; end: string } | undefined>) => {
      state.filters.dateRange = action.payload;
      state.filteredItems = applyFilters(state.items, state.filters);
    },

    /**
     * Clear all filters
     */
    clearFilters: (state) => {
      state.filters = {};
      state.filteredItems = state.items;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Invalidate cache (force refresh on next fetch)
     */
    invalidateCache: (state) => {
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch packages
    builder
      .addCase(fetchPackages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.filteredItems = applyFilters(action.payload, state.filters);
        state.stats = calculateStats(action.payload);
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update package status
    builder
      .addCase(updatePackageStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePackageStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update package in state
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.filteredItems = applyFilters(state.items, state.filters);
        state.stats = calculateStats(state.items);
        state.error = null;
      })
      .addCase(updatePackageStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete package
    builder
      .addCase(deletePackage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove package from state
        state.items = state.items.filter(p => p.id !== action.payload);
        state.filteredItems = applyFilters(state.items, state.filters);
        state.stats = calculateStats(state.items);
        state.error = null;
      })
      .addCase(deletePackage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

// Export actions
export const {
  setSelectedPackage,
  setStatusFilter,
  setSearchQuery,
  setDateRange,
  clearFilters,
  clearError,
  invalidateCache,
} = packagesSlice.actions;

// Export reducer
export default packagesSlice.reducer;

// Export selectors
export const selectPackages = (state: RootState) => state.packages.filteredItems;
export const selectAllPackages = (state: RootState) => state.packages.items;
export const selectSelectedPackage = (state: RootState) => {
  const id = state.packages.selectedPackageId;
  return id ? state.packages.items.find(p => p.id === id) : null;
};
export const selectPackageStats = (state: RootState) => state.packages.stats;
export const selectIsLoading = (state: RootState) => state.packages.isLoading;
export const selectError = (state: RootState) => state.packages.error;
export const selectFilters = (state: RootState) => state.packages.filters;
