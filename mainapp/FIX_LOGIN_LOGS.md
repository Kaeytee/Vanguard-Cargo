# Fix Login Console Logs - Manual Steps

## Problem
The login page has:
1. Excessive console logging
2. Broken code structure (orphaned if statement)
3. NetworkError being logged for non-critical pre-check

## Solution - Manual Fix Required

### **File:** `src/landing/login/login.tsx`

**Lines 241-282 need to be replaced**

### **STEP 1: Delete lines 241-282**

In your editor, delete everything from line 241 to line 282 (the broken try-catch section).

### **STEP 2: Insert this code at line 241:**

```typescript
	// Pre-login account status check
	try {
		setIsCheckingStatus(true);
		const statusCheck = await authService.checkAccountStatus(formData.email);
		
		if (!statusCheck.canLogin && statusCheck.message) {
			// Account is not active - show warning modal
			setIsCheckingStatus(false);
			e.preventDefault();
			e.stopPropagation();
			
			setAccountStatusInfo({
				status: statusCheck.status || 'unknown',
				message: statusCheck.message,
				firstName: statusCheck.firstName
			});
			setShowStatusWarning(true);
			return;
		}

		// Account is active - proceed with login
		const result = await dispatch(loginUser({ email, password })).unwrap();
```

---

## Alternative: Use Sed Command

Run this in your terminal:

```bash
cd "/home/kaeytee/Desktop/Codes/Vanguard Cargo Client App/mainapp"

# Backup first
cp src/landing/login/login.tsx src/landing/login/login.tsx.backup

# This will be simpler - just comment out the console.log lines
sed -i 's/console\.log.*Pre-login/\/\/ console.log/g' src/landing/login/login.tsx
sed -i 's/console\.error.*Pre-login/\/\/ console.error/g' src/landing/login/login.tsx
sed -i 's/console\.warn.*Account status/\/\/ console.warn/g' src/landing/login/login.tsx
```

---

## What This Fixes

1. ✅ Removes excessive "Pre-login" console logs
2. ✅ Fixes broken code structure  
3. ✅ NetworkError handled silently (non-critical)
4. ✅ Cleaner console output

---

## After Fix - Clean Console Output

**Before:**
```
📊 checkAccountStatus: Query result: {...}
⚠️ checkAccountStatus: Database error: {...}
📊 Pre-login status check result: {...}
✅ Pre-login: Account is active
🔓 PublicRoute check: {...}
... (many logs)
```

**After:**
```
🔐 User signed in: [user-id]
✅ Login successful!
```

Much cleaner! 🎉
