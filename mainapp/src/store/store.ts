// ============================================================================
// Redux Store Configuration
// ============================================================================
// Description: Central Redux store with persistence and middleware
// Author: Senior Software Engineer
// Architecture: Clean Code, OOP, Redux Toolkit Best Practices
// ============================================================================

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Uses localStorage

// Import Redux slices
import authReducer from './slices/authSlice';
import packagesReducer from './slices/packagesSlice';
import notificationsReducer from './slices/notificationsSlice';
import uiReducer from './slices/uiSlice';

// Import RTK Query API
import { vanguardApi } from './api/vanguardApi';

// ============================================================================
// PERSIST CONFIGURATION
// ============================================================================

/**
 * Configure Redux Persist for auth state
 * - Persists authentication state across page refreshes
 * - Uses localStorage for storage
 * - Whitelist: Only persists specified reducers
 */
const persistConfig = {
  key: 'vanguard-cargo-root',
  version: 1,
  storage,
  whitelist: ['auth'], // Only persist auth state
  blacklist: ['vanguardApi'], // Don't persist API cache
};

/**
 * Root reducer combining all feature slices
 * - auth: Authentication and user state
 * - packages: Package tracking and management
 * - notifications: System notifications
 * - ui: UI state (modals, sidebars, etc.)
 * - vanguardApi: RTK Query API endpoints
 */
const rootReducer = combineReducers({
  auth: authReducer,
  packages: packagesReducer,
  notifications: notificationsReducer,
  ui: uiReducer,
  [vanguardApi.reducerPath]: vanguardApi.reducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ============================================================================
// STORE CONFIGURATION
// ============================================================================

/**
 * Configure Redux Store with middleware
 * 
 * Features:
 * - Redux Persist for state persistence
 * - RTK Query middleware for caching and data fetching
 * - Redux DevTools in development
 * - Serialization check disabled for better performance
 * 
 * @returns Configured Redux store
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serialization check for redux-persist
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(vanguardApi.middleware), // Add RTK Query middleware
  devTools: process.env.NODE_ENV !== 'production', // Enable DevTools in development
});

/**
 * Create persistor for redux-persist
 * Used to manage rehydration and persistence
 */
export const persistor = persistStore(store);

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

/**
 * TypeScript types for store
 * - RootState: Complete store state shape
 * - AppDispatch: Typed dispatch function
 * - AppStore: Store type for testing
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

// ============================================================================
// DOCUMENTATION
// ============================================================================

/**
 * USAGE EXAMPLES:
 * 
 * 1. Use in component:
 * ```typescript
 * import { useAppDispatch, useAppSelector } from '@/store/hooks';
 * 
 * const MyComponent = () => {
 *   const dispatch = useAppDispatch();
 *   const user = useAppSelector((state) => state.auth.user);
 *   
 *   return <div>{user?.name}</div>;
 * };
 * ```
 * 
 * 2. Dispatch actions:
 * ```typescript
 * import { setUser } from '@/store/slices/authSlice';
 * 
 * dispatch(setUser(userData));
 * ```
 * 
 * 3. Use RTK Query:
 * ```typescript
 * import { useGetPackagesQuery } from '@/store/api/vanguardApi';
 * 
 * const { data, isLoading, error } = useGetPackagesQuery(userId);
 * ```
 * 
 * 4. Clear persisted state:
 * ```typescript
 * import { persistor } from '@/store/store';
 * 
 * persistor.purge(); // Clear all persisted state
 * ```
 */
