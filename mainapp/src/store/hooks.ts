// ============================================================================
// Redux Typed Hooks
// ============================================================================
// Description: Type-safe Redux hooks for TypeScript
// Author: Senior Software Engineer
// Purpose: Provide type-safe alternatives to useDispatch and useSelector
// ============================================================================

import { useDispatch, useSelector, useStore } from 'react-redux';
import type { RootState, AppDispatch, AppStore } from './store';

// ============================================================================
// TYPED HOOKS
// ============================================================================

/**
 * Type-safe useDispatch hook
 * 
 * Use this instead of plain `useDispatch` to get proper TypeScript types
 * for all dispatched actions including async thunks
 * 
 * @example
 * ```typescript
 * const dispatch = useAppDispatch();
 * dispatch(loginUser({ email, password }));
 * ```
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Type-safe useSelector hook
 * 
 * Use this instead of plain `useSelector` to get automatic type inference
 * for the state shape
 * 
 * @example
 * ```typescript
 * const user = useAppSelector((state) => state.auth.user);
 * const packages = useAppSelector((state) => state.packages.items);
 * ```
 */
export const useAppSelector = useSelector.withTypes<RootState>();

/**
 * Type-safe useStore hook
 * 
 * Use this to get direct access to the Redux store
 * Rarely needed, but useful for advanced use cases
 * 
 * @example
 * ```typescript
 * const store = useAppStore();
 * const state = store.getState();
 * ```
 */
export const useAppStore = useStore.withTypes<AppStore>();

// ============================================================================
// DOCUMENTATION
// ============================================================================

/**
 * WHY USE THESE HOOKS?
 * 
 * 1. **Type Safety**: Automatic TypeScript inference for all Redux state
 * 2. **Better DX**: IntelliSense suggestions for state properties
 * 3. **Catch Errors**: TypeScript catches incorrect state access at compile time
 * 4. **Best Practice**: Recommended by Redux Toolkit documentation
 * 
 * MIGRATION FROM OLD HOOKS:
 * 
 * Before:
 * ```typescript
 * import { useDispatch, useSelector } from 'react-redux';
 * const dispatch = useDispatch();
 * const user = useSelector((state: RootState) => state.auth.user);
 * ```
 * 
 * After:
 * ```typescript
 * import { useAppDispatch, useAppSelector } from '@/store/hooks';
 * const dispatch = useAppDispatch();
 * const user = useAppSelector((state) => state.auth.user); // No type annotation needed!
 * ```
 */
