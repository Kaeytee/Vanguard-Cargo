# Redux Toolkit - Quick Reference Guide

## 📋 Cheat Sheet for Common Operations

---

## 🔐 Authentication

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, logoutUser, selectIsAuthenticated, selectProfile } from '@/store/slices/authSlice';

// Login
const dispatch = useAppDispatch();
await dispatch(loginUser({ email, password })).unwrap();

// Logout
await dispatch(logoutUser()).unwrap();

// Get auth state
const isAuthenticated = useAppSelector(selectIsAuthenticated);
const profile = useAppSelector(selectProfile);
const user = useAppSelector(state => state.auth.user);
```

---

## 📦 Packages with Caching

```typescript
import { useGetPackagesQuery, useUpdatePackageStatusMutation } from '@/store/api/vanguardApi';

// Fetch packages (auto-cached for 5 minutes)
const { data: packages, isLoading, error, refetch } = useGetPackagesQuery(userId);

// Update package status
const [updateStatus, { isLoading }] = useUpdatePackageStatusMutation();
await updateStatus({ packageId, status: 'processing', notes: 'Started' }).unwrap();

// Force refresh
refetch();
```

---

## 📊 Package State Management

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchPackages, 
  setStatusFilter, 
  setSearchQuery,
  selectPackages,
  selectPackageStats 
} from '@/store/slices/packagesSlice';

// Fetch packages
await dispatch(fetchPackages({ userId, forceRefresh: true })).unwrap();

// Filter by status
dispatch(setStatusFilter('processing'));

// Search
dispatch(setSearchQuery('amazon'));

// Get filtered results
const packages = useAppSelector(selectPackages);
const stats = useAppSelector(selectPackageStats);
```

---

## 🔔 Notifications

```typescript
import { useGetNotificationsQuery, useMarkNotificationAsReadMutation } from '@/store/api/vanguardApi';

// Get notifications (auto-cached)
const { data: notifications } = useGetNotificationsQuery(userId);

// Mark as read
const [markAsRead] = useMarkNotificationAsReadMutation();
await markAsRead(notificationId).unwrap();

// Real-time polling (every 30 seconds)
const { data } = useGetNotificationsQuery(userId, {
  pollingInterval: 30000,
});
```

---

## 🎨 UI State

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  toggleTheme,
  openModal,
  closeModal,
  showToast,
  toggleSidebar 
} from '@/store/slices/uiSlice';

// Toggle theme
dispatch(toggleTheme());

// Show toast
dispatch(showToast({ type: 'success', message: 'Saved!' }));

// Open modal
dispatch(openModal({ type: 'package-edit', data: { packageId: '123' } }));

// Close modal
dispatch(closeModal());

// Toggle sidebar
dispatch(toggleSidebar());
```

---

## 🔄 Cache Management

```typescript
import { vanguardApi } from '@/store/api/vanguardApi';

// Invalidate specific cache
dispatch(vanguardApi.util.invalidateTags(['Packages']));
dispatch(vanguardApi.util.invalidateTags([{ type: 'Package', id: '123' }]));

// Reset entire API cache
dispatch(vanguardApi.util.resetApiState());

// Prefetch data
dispatch(vanguardApi.endpoints.getPackages.initiate(userId));
```

---

## 🎯 Conditional Fetching

```typescript
// Skip query if condition not met
const { data } = useGetPackagesQuery(userId, {
  skip: !userId || !isAuthenticated,
});

// Disable polling
const { data } = useGetNotificationsQuery(userId, {
  pollingInterval: isVisible ? 30000 : 0, // Poll only when visible
});
```

---

## 🔨 Optimistic Updates

```typescript
const [updatePackage] = useUpdatePackageStatusMutation();

// Optimistic update (UI updates immediately)
const result = await updatePackage({
  packageId,
  status: 'processing'
}).unwrap();

// On error, cache automatically rolls back
```

---

## 📝 Selectors

```typescript
// Basic selector
const user = useAppSelector(state => state.auth.user);

// Memoized selector (from slice)
const packages = useAppSelector(selectPackages);

// Custom selector
const unreadCount = useAppSelector(state => 
  state.notifications.items.filter(n => !n.is_read).length
);

// Multiple selectors
const { isAuthenticated, profile } = useAppSelector(state => ({
  isAuthenticated: state.auth.isAuthenticated,
  profile: state.auth.profile
}));
```

---

## 🚨 Error Handling

```typescript
// With async thunks
try {
  await dispatch(loginUser(credentials)).unwrap();
  // Success
} catch (error) {
  // Error handling
  console.error('Login failed:', error);
}

// With RTK Query
const { data, error, isError } = useGetPackagesQuery(userId);

if (isError) {
  return <div>Error: {error.message}</div>;
}

// With mutations
const [updatePackage, { error: mutationError }] = useUpdatePackageStatusMutation();

if (mutationError) {
  dispatch(showToast({ type: 'error', message: 'Update failed' }));
}
```

---

## 🔄 Loading States

```typescript
// From RTK Query
const { isLoading, isFetching, isSuccess } = useGetPackagesQuery(userId);

// From async thunks
const isLoading = useAppSelector(state => state.packages.isLoading);

// Multiple loading states
const isAnyLoading = useAppSelector(state => 
  state.auth.isLoading || state.packages.isLoading
);
```

---

## 🎯 Best Practices

### 1. Use Typed Hooks
```typescript
// ✅ Good
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// ❌ Bad
import { useDispatch, useSelector } from 'react-redux';
```

### 2. Use Selectors from Slices
```typescript
// ✅ Good
import { selectPackages } from '@/store/slices/packagesSlice';
const packages = useAppSelector(selectPackages);

// ❌ Bad
const packages = useAppSelector(state => state.packages.filteredItems);
```

### 3. Handle Errors
```typescript
// ✅ Good
try {
  await dispatch(action()).unwrap();
} catch (error) {
  handleError(error);
}

// ❌ Bad
await dispatch(action()); // No error handling
```

### 4. Skip Unnecessary Queries
```typescript
// ✅ Good
const { data } = useGetPackagesQuery(userId, { skip: !userId });

// ❌ Bad
const { data } = useGetPackagesQuery(userId); // Runs even if userId is null
```

### 5. Invalidate Cache on Mutations
```typescript
// ✅ Good - RTK Query auto-invalidates
const [updatePackage] = useUpdatePackageStatusMutation(); // Auto-invalidates

// ✅ Good - Manual invalidation
await updateInDatabase();
dispatch(vanguardApi.util.invalidateTags(['Packages']));

// ❌ Bad - No invalidation
await updateInDatabase(); // Cache becomes stale
```

---

## 🐛 Debugging

### Redux DevTools
1. Open browser DevTools
2. Navigate to "Redux" tab
3. View:
   - State tree
   - Action history
   - State diffs
   - Time travel

### Console Logging
```typescript
// Log selector results
const packages = useAppSelector(state => {
  console.log('Packages:', state.packages.items);
  return state.packages.items;
});

// Log actions
dispatch(loginUser(credentials)); // Visible in Redux DevTools
```

### Check Cache Status
```typescript
// Check if query is cached
const queryState = useAppSelector(state => 
  state.vanguardApi.queries[`getPackages("${userId}")`]
);

console.log('Cache status:', queryState?.status);
console.log('Cache data:', queryState?.data);
```

---

## 📦 Package Manager Commands (pnpm)

```bash
# Install dependencies
pnpm install

# Add new package
pnpm add package-name

# Remove package
pnpm remove package-name

# Update dependencies
pnpm update

# Run dev server
pnpm dev

# Build for production
pnpm build
```

---

## 🔗 Quick Links

- [Full Redux Setup Guide](./REDUX_SETUP.md)
- [Redis Caching Guide](./REDIS_CACHING.md)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)

---

**Keep this handy for quick reference! 📌**
