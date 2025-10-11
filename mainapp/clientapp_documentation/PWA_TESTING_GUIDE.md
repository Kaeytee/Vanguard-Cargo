# 🧪 PWA & Performance Testing Guide
## Vanguard Cargo Application

---

## 📋 Prerequisites

### Build the Production App
```bash
cd /home/kaeytee/Desktop/Codes/Vanguard\ Cargo\ Client\ App/mainapp
npm run build
npm run preview
```

**Note**: Service Worker only works in production builds, not in development mode.

---

## 🎯 Test 1: Service Worker Registration

### Steps:
1. Build and run preview server:
   ```bash
   npm run build && npm run preview
   ```

2. Open browser to `http://localhost:4173`

3. Open DevTools → **Application** tab

4. Check **Service Workers** section

### ✅ Success Indicators:
- Service Worker status: **activated and is running**
- Source: `sw.js` or similar
- Console log: `🚀 Service Worker registered successfully`

### 📸 Screenshot:
```
Service Workers
├─ sw.js
   ├─ Status: activated and is running
   ├─ Source: sw.js
   └─ Update on reload: ☐
```

---

## 🎯 Test 2: Cache Storage

### Steps:
1. With app running, open DevTools → **Application**

2. Expand **Cache Storage** in left sidebar

3. Check for these caches:
   - `workbox-precache-v2-...` (static assets)
   - `api-cache` (API responses)
   - `image-cache` (images)
   - `font-cache` (fonts)

### ✅ Success Indicators:
- Multiple cache entries visible
- Static assets (JS, CSS, HTML) in precache
- Images cached after viewing pages
- Fonts cached after loading

### 📊 Expected Cache Sizes:
- **Precache**: ~500KB-1MB (all static assets)
- **API Cache**: ~50-200KB (API responses)
- **Image Cache**: ~100-500KB (loaded images)
- **Font Cache**: ~50-100KB (web fonts)

---

## 🎯 Test 3: Offline Functionality

### Steps:
1. With app running, load Dashboard page completely

2. Open DevTools → **Application** → **Service Workers**

3. Check **"Offline"** checkbox

4. Refresh the page (F5)

5. Navigate to different pages (Settings, Profile, etc.)

### ✅ Success Indicators:
- ✅ App loads successfully while offline
- ✅ Previously viewed pages work
- ✅ Cached images display correctly
- ✅ Navigation works (for cached routes)
- ❌ API calls may show cached data or errors (expected)

### 📝 Notes:
- Only **previously visited pages** will work offline
- Fresh API data won't be available (uses cache)
- Non-cached images won't load

---

## 🎯 Test 4: Cache Performance

### Test Scenario: Compare Initial vs Repeat Visit

#### Initial Visit (Cold Cache):
1. Clear all caches:
   - DevTools → Application → Clear storage → Clear site data
   
2. Open DevTools → **Network** tab

3. Check **Disable cache** (temporarily)

4. Load homepage: `http://localhost:4173`

5. Note the total load time and size

#### Repeat Visit (Warm Cache):
1. Uncheck **Disable cache**

2. Refresh the page (F5)

3. Note the load time and size

### ✅ Success Metrics:
| Metric | Initial Load | Cached Load | Improvement |
|--------|--------------|-------------|-------------|
| **Load Time** | 2-3s | 0.5-1s | 60-70% faster |
| **Data Transfer** | 800KB-1MB | 50-200KB | 70-90% less |
| **Requests** | 30-50 | 5-15 | 70% fewer |

---

## 🎯 Test 5: API Caching

### Steps:
1. Open DevTools → **Network** tab

2. Navigate to Dashboard (loads packages, shipments)

3. Note the API calls made

4. Navigate away (to Settings)

5. Navigate back to Dashboard

6. Check Network tab

### ✅ Success Indicators:
- **First Load**: API calls to Supabase visible
- **Repeat Load**: No new API calls (served from cache)
- Console shows: Data loaded from cache
- Dashboard loads **instantly** on repeat visits

### 🔍 Check Cache:
DevTools → Application → Cache Storage → `api-cache`

Should contain:
- Package data requests
- Shipment data requests
- User profile requests

---

## 🎯 Test 6: Image Lazy Loading

### Steps:
1. Open a page with multiple images (Homepage, Dashboard)

2. Open DevTools → **Network** tab → Filter by **Img**

3. Load the page

4. Scroll down slowly

### ✅ Success Indicators:
- Only **2-3 images** load initially (above the fold)
- Additional images load **as you scroll**
- Network tab shows images loading progressively
- **Blur placeholder** visible before image loads

### 📊 Expected Behavior:
```
Page Load:
├─ Hero image (eager load)
├─ Logo (eager load)
└─ First 2-3 images (in viewport)

User Scrolls:
├─ Image enters viewport (200px before)
├─ Shows blur placeholder
├─ Loads actual image
└─ Fades in smoothly
```

---

## 🎯 Test 7: Code Splitting

### Steps:
1. Open DevTools → **Network** tab → Filter by **JS**

2. Load homepage

3. Check loaded JS files

4. Navigate to Dashboard

5. Check for new JS files

### ✅ Success Indicators:
- **Homepage**: Only loads main bundle (~250KB)
- **Dashboard**: Loads dashboard chunk separately
- **Settings**: Loads settings chunk when needed
- **Total**: Multiple smaller chunks instead of one large bundle

### 📦 Expected Bundles:
```
Homepage:
├─ main.js (~200-250KB)
└─ vendor.js (~150-200KB)

Navigate to Dashboard:
├─ dashboard.chunk.js (~50-80KB)
└─ Additional dependencies

Navigate to Settings:
├─ settings.chunk.js (~30-50KB)
```

---

## 🎯 Test 8: PWA Installation

### Desktop (Chrome/Edge):
1. Visit app in production

2. Look for **install icon** in address bar (⊕)

3. Click install

4. App opens in standalone window

### Mobile (Chrome Android):
1. Visit app in production

2. Banner appears: "Add Vanguard Cargo to Home screen"

3. Tap "Add"

4. Icon appears on home screen

### iOS Safari:
1. Visit app in production

2. Tap Share button

3. Tap "Add to Home Screen"

4. Enter name → Add

### ✅ Success Indicators:
- App installs successfully
- Opens in standalone mode (no browser UI)
- App icon visible on home/desktop
- Works like native app

---

## 🎯 Test 9: Update Flow

### Steps:
1. With app running, make a small code change

2. Rebuild:
   ```bash
   npm run build
   ```

3. Refresh the preview server:
   ```bash
   npm run preview
   ```

4. In browser, wait 1-2 minutes

### ✅ Success Indicators:
- Dialog appears: **"New version available! Reload to update?"**
- Click "OK" → App refreshes with new version
- Console shows: `🔄 New content available! Updating...`

---

## 🎯 Test 10: Lighthouse Audit

### Steps:
1. Open DevTools → **Lighthouse** tab

2. Select:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
   - ✅ Progressive Web App

3. Click **"Analyze page load"**

### ✅ Target Scores:
| Category | Target | Status |
|----------|--------|--------|
| **Performance** | 90-100 | 🟢 Excellent |
| **Accessibility** | 90-100 | 🟢 Excellent |
| **Best Practices** | 90-100 | 🟢 Excellent |
| **SEO** | 90-100 | 🟢 Excellent |
| **PWA** | ✅ | 🟢 Installable |

### Key Metrics:
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Speed Index**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1

---

## 🎯 Test 11: Network Throttling

### Test on Slow 3G:
1. DevTools → **Network** tab

2. Select **Slow 3G** throttling

3. Disable cache

4. Load homepage

### ✅ Success Indicators:
- Page still loads in **3-5s** (acceptable on Slow 3G)
- Progressive rendering (content appears gradually)
- No complete white screen
- Spinner shows during loading

### Test with Cache:
1. Enable cache

2. Reload page

3. Load time should be **< 2s** even on Slow 3G

---

## 🎯 Test 12: React Query Caching

### Steps:
1. Navigate to Dashboard

2. Open DevTools → **Console**

3. Look for React Query cache logs (if enabled)

4. Navigate away and back to Dashboard

### ✅ Success Indicators:
- Data loads **instantly** on repeat visits
- No loading spinners (data from cache)
- Background refetch happens silently
- Stale data updated after 5 minutes

### Test Cache Invalidation:
1. Create a new package

2. Dashboard should **auto-update** with new data

3. Cache should be invalidated and refetched

---

## 🎯 Test 13: Cross-Browser Testing

### Browsers to Test:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (Desktop & Mobile)
- ✅ Chrome Android
- ✅ Samsung Internet

### What to Check:
- Service Worker works
- Caching works correctly
- PWA installation available
- Lazy loading works
- Code splitting works

---

## 📊 Performance Benchmarks

### Expected Results:

#### Desktop (Fast Connection):
```
Initial Load:
├─ FCP: 0.8-1.2s
├─ LCP: 1.2-1.8s
├─ TTI: 1.5-2.5s
└─ Total: 800KB-1MB

Repeat Load (Cached):
├─ FCP: 0.3-0.5s
├─ LCP: 0.5-0.8s
├─ TTI: 0.8-1.2s
└─ Total: 50-200KB
```

#### Mobile (3G Connection):
```
Initial Load:
├─ FCP: 2-3s
├─ LCP: 3-4s
├─ TTI: 4-5s
└─ Total: 800KB-1MB

Repeat Load (Cached):
├─ FCP: 0.8-1.2s
├─ LCP: 1.2-1.8s
├─ TTI: 1.8-2.5s
└─ Total: 50-200KB
```

---

## 🔧 Troubleshooting

### Service Worker Not Registering:
- ✅ Check: Running production build (`npm run build`)
- ✅ Check: HTTPS or localhost (required for SW)
- ✅ Check: Browser supports Service Workers
- ✅ Check: Console for error messages

### Cache Not Working:
- ✅ Check: Service Worker status (activated?)
- ✅ Check: Cache Storage in DevTools
- ✅ Check: Network tab (requests from SW?)
- ✅ Clear cache and try again

### Offline Mode Not Working:
- ✅ Visit pages while **online first** (to cache them)
- ✅ Check cache contains required assets
- ✅ Check Service Worker is active
- ✅ Some API calls expected to fail offline

### PWA Not Installable:
- ✅ Check: manifest.json generated correctly
- ✅ Check: Icons exist (192x192, 512x512)
- ✅ Check: Running on HTTPS or localhost
- ✅ Check: Service Worker registered

---

## 🎉 Success Checklist

Mark off each test as you complete it:

- [ ] Service Worker registered
- [ ] Cache Storage contains data
- [ ] App works offline
- [ ] Repeat visits 60-70% faster
- [ ] API responses cached
- [ ] Images lazy load correctly
- [ ] Code splitting working (multiple chunks)
- [ ] PWA installable
- [ ] Update flow works
- [ ] Lighthouse score 90+
- [ ] Works on Slow 3G
- [ ] React Query caching working
- [ ] Cross-browser compatible

---

## 📚 Resources

- Service Worker: https://web.dev/service-workers-cache-storage/
- PWA Checklist: https://web.dev/pwa-checklist/
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- Workbox: https://developers.google.com/web/tools/workbox
- React Query: https://tanstack.com/query/latest

---

**Congratulations! Your app now has production-grade performance optimizations! 🚀**
