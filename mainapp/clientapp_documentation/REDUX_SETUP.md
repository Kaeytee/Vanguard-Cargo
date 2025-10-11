# Redux Toolkit & Caching Implementation Guide

## 📦 Overview

This document provides a comprehensive guide to the Redux Toolkit implementation with RTK Query caching for the Vanguard Cargo Client Application.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

The following packages have been added to `package.json`:
- `@reduxjs/toolkit` - Redux state management
- `react-redux` - React bindings for Redux
- `redux-persist` - State persistence to localStorage

**Note**: This project uses **pnpm** as the package manager.

### 2. Redux Store Structure

```
src/store/
├── store.ts                      # Main store configuration
├── hooks.ts                      # Typed Redux hooks
├── api/
│   └── vanguardApi.ts           # RTK Query API with caching
└── slices/
    ├── authSlice.ts             # Authentication state
    ├── packagesSlice.ts         # Package management
    ├── notificationsSlice.ts    # Notifications
    └── uiSlice.ts               # UI state (modals, theme, etc.)
```

---

## 🎯 Key Features

### ✅ State Management
- **Centralized state** for auth, packages, notifications, and UI
- **TypeScript support** with full type safety
- **Redux DevTools** integration for debugging
- **Immutable updates** with Immer (built into Redux Toolkit)

### ✅ Automatic Caching (RTK Query)
- **5-minute cache** by default for all API calls
- **Tag-based invalidation** for smart cache updates
- **Automatic refetching** when data becomes stale
- **Optimistic updates** for better UX
- **Polling support** for real-time data

### ✅ State Persistence
- **Auth state** persisted to localStorage
- **Automatic rehydration** on page reload
- **Configurable persistence** per slice

---

## 📚 Usage Examples

### Authentication

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, selectIsAuthenticated, selectProfile } from '@/store/slices/authSlice';

function LoginComponent() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const profile = useAppSelector(selectProfile);

  const handleLogin = async (email: string, password: string) => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // Login successful - state automatically updated
    } catch (error) {
      // Handle error
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {profile?.firstName}!</p>
      ) : (
        <button onClick={() => handleLogin('user@example.com', 'password')}>
          Login
        </button>
      )}
    </div>
  );
}
```

### Fetching Packages with Automatic Caching

```typescript
import { useGetPackagesQuery } from '@/store/api/vanguardApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';

function PackagesPage() {
  const user = useAppSelector(selectUser);
  
  // Automatic caching - won't refetch if cache is valid
  const { 
    data: packages, 
    isLoading, 
    error, 
    refetch 
  } = useGetPackagesQuery(user?.id || '', {
    skip: !user?.id, // Skip query if user ID not available
    pollingInterval: 60000, // Poll every 60 seconds (optional)
  });

  if (isLoading) return <div>Loading packages...</div>;
  if (error) return <div>Error loading packages</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      {packages?.map(pkg => (
        <div key={pkg.id}>{pkg.package_id}</div>
      ))}
    </div>
  );
}
```

### Updating Package Status

```typescript
import { useUpdatePackageStatusMutation } from '@/store/api/vanguardApi';
import { showToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store/hooks';

function PackageActions({ packageId }: { packageId: string }) {
  const dispatch = useAppDispatch();
  const [updateStatus, { isLoading }] = useUpdatePackageStatusMutation();

  const handleProcess = async () => {
    try {
      await updateStatus({
        packageId,
        status: 'processing',
        notes: 'Started processing'
      }).unwrap();

      // Show success toast
      dispatch(showToast({
        type: 'success',
        message: 'Package status updated',
      }));
    } catch (error) {
      // Show error toast
      dispatch(showToast({
        type: 'error',
        message: 'Failed to update package',
      }));
    }
  };

  return (
    <button onClick={handleProcess} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Process Package'}
    </button>
  );
}
```

### Managing UI State

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  openModal, 
  closeModal, 
  showToast,
  toggleTheme,
  selectTheme,
  selectActiveModal 
} from '@/store/slices/uiSlice';

function UIExample() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const activeModal = useAppSelector(selectActiveModal);

  return (
    <div>
      {/* Toggle theme */}
      <button onClick={() => dispatch(toggleTheme())}>
        Current theme: {theme}
      </button>

      {/* Open modal */}
      <button onClick={() => dispatch(openModal({ 
        type: 'package-edit', 
        data: { packageId: '123' } 
      }))}>
        Edit Package
      </button>

      {/* Show toast */}
      <button onClick={() => dispatch(showToast({
        type: 'success',
        message: 'Operation completed!',
        duration: 3000
      }))}>
        Show Toast
      </button>

      {/* Close modal */}
      {activeModal && (
        <button onClick={() => dispatch(closeModal())}>
          Close Modal
        </button>
      )}
    </div>
  );
}
```

### Filtering & Searching Packages

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  setStatusFilter, 
  setSearchQuery,
  clearFilters,
  selectPackages,
  selectPackageStats 
} from '@/store/slices/packagesSlice';

function PackageFilters() {
  const dispatch = useAppDispatch();
  const packages = useAppSelector(selectPackages); // Filtered packages
  const stats = useAppSelector(selectPackageStats);

  return (
    <div>
      {/* Status filter */}
      <select onChange={(e) => dispatch(setStatusFilter(e.target.value as any))}>
        <option value="">All Statuses</option>
        <option value="pending">Pending ({stats.pending})</option>
        <option value="processing">Processing ({stats.processing})</option>
        <option value="shipped">Shipped ({stats.shipped})</option>
      </select>

      {/* Search */}
      <input
        type="text"
        placeholder="Search packages..."
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
      />

      {/* Clear filters */}
      <button onClick={() => dispatch(clearFilters())}>
        Clear Filters
      </button>

      {/* Display filtered results */}
      <p>Showing {packages.length} of {stats.total} packages</p>
    </div>
  );
}
```

---

## 🔄 Migration from Context API

### Before (Context API)
```typescript
import { useAuth } from '@/context/AuthContext';

function Component() {
  const { user, login, logout } = useAuth();
  // ...
}
```

### After (Redux)
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, logoutUser, selectUser } from '@/store/slices/authSlice';

function Component() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  
  const login = (email: string, password: string) => {
    dispatch(loginUser({ email, password }));
  };
  
  const logout = () => {
    dispatch(logoutUser());
  };
  // ...
}
```

---

## 🎨 Cache Management

### Manual Cache Invalidation

```typescript
import { vanguardApi } from '@/store/api/vanguardApi';
import { useAppDispatch } from '@/store/hooks';

function RefreshButton() {
  const dispatch = useAppDispatch();

  const handleRefresh = () => {
    // Invalidate all packages cache
    dispatch(vanguardApi.util.invalidateTags(['Packages']));
    
    // Or invalidate specific package
    dispatch(vanguardApi.util.invalidateTags([{ type: 'Package', id: '123' }]));
  };

  return <button onClick={handleRefresh}>Refresh</button>;
}
```

### Configure Cache Duration

```typescript
// In vanguardApi.ts
export const vanguardApi = createApi({
  // ... other config
  keepUnusedDataFor: 300, // 5 minutes (in seconds)
  refetchOnMountOrArgChange: true, // Refetch if data is stale
});
```

---

## 🐛 Debugging

### Redux DevTools

1. Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
2. Open browser DevTools
3. Navigate to "Redux" tab
4. Inspect:
   - Current state
   - Action history
   - Time travel debugging
   - State diff

### Logging

```typescript
// Enable RTK Query logging
import { setupListeners } from '@reduxjs/toolkit/query';

setupListeners(store.dispatch);
```

---

## 📊 Performance Optimization

### 1. Selective Subscriptions
```typescript
// Only subscribe to specific fields
const userName = useAppSelector(state => state.auth.profile?.firstName);
```

### 2. Memoized Selectors
```typescript
import { createSelector } from '@reduxjs/toolkit';

const selectPackages = (state: RootState) => state.packages.items;
const selectStatusFilter = (state: RootState) => state.packages.filters.status;

// Memoized selector - only recomputes when dependencies change
const selectFilteredPackages = createSelector(
  [selectPackages, selectStatusFilter],
  (packages, status) => {
    if (!status) return packages;
    return packages.filter(p => p.status === status);
  }
);
```

### 3. Skip Queries When Not Needed
```typescript
const { data } = useGetPackagesQuery(userId, {
  skip: !userId || !isAuthenticated,
});
```

---

## 🔐 Security Best Practices

1. **Never store sensitive data in Redux**
   - Passwords, credit cards, etc.
   - Use secure storage or server-side only

2. **Sanitize user inputs**
   - Before dispatching to Redux
   - Validate in reducers

3. **Use RLS (Row Level Security)**
   - Database-level security
   - Don't rely on client-side only

---

## 🚀 Next Steps

1. **Install dependencies**: `npm install`
2. **Test Redux DevTools**: Check state in browser
3. **Migrate components**: Start with authentication
4. **Remove Context API**: After full migration
5. **Add server-side caching**: See REDIS_CACHING.md

---

## 📖 Additional Resources

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Redux Persist](https://github.com/rt2zz/redux-persist)

---

## ✅ Checklist

- [ ] Run `pnpm install` to install Redux dependencies
- [ ] Test Redux DevTools in browser
- [ ] Migrate authentication to Redux
- [ ] Migrate package management to Redux
- [ ] Migrate UI state to Redux
- [ ] Remove old Context API providers
- [ ] Test all features with Redux
- [ ] Deploy and monitor performance

---

**Happy coding! 🎉**
