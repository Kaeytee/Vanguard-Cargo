# Redis Caching Implementation Guide

## 📦 Overview

This guide covers implementing **Upstash Redis** for server-side caching in your Vanguard Cargo application using Supabase Edge Functions.

---

## 🎯 Why Redis for Server-Side Caching?

### Benefits
- **Performance**: Sub-millisecond response times
- **Scalability**: Handle thousands of requests per second
- **Cost-effective**: Reduce database load and costs
- **Global distribution**: Upstash Redis replicated worldwide
- **Zero maintenance**: Serverless Redis with auto-scaling

### Use Cases
1. **API Response Caching**: Cache Supabase query results
2. **Session Management**: Store user sessions
3. **Rate Limiting**: Implement API rate limits
4. **Real-time Data**: Cache frequently accessed data
5. **Queue Management**: Background job processing

---

## 🚀 Setup Upstash Redis

### 1. Create Upstash Account

1. Visit [Upstash Console](https://console.upstash.com/)
2. Sign up with GitHub or email
3. Create a new Redis database:
   - **Name**: `vanguard-cargo-cache`
   - **Type**: Regional or Global
   - **Region**: Select closest to your users
   - **Eviction**: `allkeys-lru` (recommended)

### 2. Get Connection Details

After creating the database, note:
```
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### 3. Install Dependencies

```bash
pnpm add @upstash/redis
```

Add to `package.json`:
```json
{
  "dependencies": {
    "@upstash/redis": "^1.28.0"
  }
}
```

**Note**: This project uses **pnpm** as the package manager.

---

## 🔧 Implementation

### 1. Create Redis Client Utility

Create `src/lib/redis.ts`:

```typescript
// ============================================================================
// Redis Client Configuration
// ============================================================================
// Description: Upstash Redis client for server-side caching
// Author: Senior Software Engineer
// Features: REST API, automatic serialization, TTL support
// ============================================================================

import { Redis } from '@upstash/redis';

/**
 * Redis client instance
 * 
 * Configuration:
 * - REST API (works in Edge Functions)
 * - Automatic JSON serialization
 * - Global distribution
 * - No connection pooling needed
 */
export const redis = new Redis({
  url: import.meta.env.VITE_UPSTASH_REDIS_REST_URL,
  token: import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Cache key prefixes for organization
 */
export const CacheKeys = {
  USER_PROFILE: 'user:profile:',
  PACKAGES: 'packages:user:',
  NOTIFICATIONS: 'notifications:user:',
  DELIVERY_CODES: 'delivery:user:',
  API_RESPONSE: 'api:',
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 1800,          // 30 minutes
  VERY_LONG: 3600,     // 1 hour
  DAY: 86400,          // 24 hours
} as const;

/**
 * Redis Cache Service
 * 
 * Provides type-safe caching operations
 * with automatic serialization/deserialization
 */
export class RedisCache {
  /**
   * Get cached value
   * 
   * @param key - Cache key
   * @returns Cached value or null
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value as T | null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Set cached value with TTL
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds
   */
  static async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await redis.set(key, value, { ex: ttl });
      } else {
        await redis.set(key, value);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  /**
   * Delete cached value
   * 
   * @param key - Cache key
   */
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  }

  /**
   * Delete multiple keys by pattern
   * 
   * @param pattern - Key pattern (e.g., "user:*")
   */
  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis DEL pattern error:', error);
    }
  }

  /**
   * Check if key exists
   * 
   * @param key - Cache key
   * @returns True if exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Increment counter
   * 
   * @param key - Counter key
   * @param amount - Amount to increment (default: 1)
   * @returns New counter value
   */
  static async incr(key: string, amount: number = 1): Promise<number> {
    try {
      const result = await redis.incrby(key, amount);
      return result;
    } catch (error) {
      console.error('Redis INCR error:', error);
      return 0;
    }
  }

  /**
   * Set expiration on existing key
   * 
   * @param key - Cache key
   * @param ttl - Time to live in seconds
   */
  static async expire(key: string, ttl: number): Promise<void> {
    try {
      await redis.expire(key, ttl);
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
    }
  }
}

/**
 * Cache-aside pattern helper
 * 
 * Automatically handles cache misses by fetching from database
 * 
 * @param key - Cache key
 * @param ttl - Time to live in seconds
 * @param fetchFn - Function to fetch data on cache miss
 * @returns Cached or fresh data
 * 
 * @example
 * ```typescript
 * const packages = await cacheAside(
 *   `${CacheKeys.PACKAGES}${userId}`,
 *   CacheTTL.MEDIUM,
 *   async () => {
 *     const { data } = await supabase
 *       .from('packages')
 *       .select('*')
 *       .eq('user_id', userId);
 *     return data;
 *   }
 * );
 * ```
 */
export async function cacheAside<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = await RedisCache.get<T>(key);
  
  if (cached !== null) {
    console.log(`Cache HIT: ${key}`);
    return cached;
  }

  console.log(`Cache MISS: ${key}`);
  
  // Fetch from database
  const fresh = await fetchFn();
  
  // Store in cache
  await RedisCache.set(key, fresh, ttl);
  
  return fresh;
}

/**
 * Cache invalidation helper
 * 
 * Invalidates related cache keys when data changes
 * 
 * @param userId - User ID for scoped invalidation
 * @param types - Cache types to invalidate
 * 
 * @example
 * ```typescript
 * await invalidateUserCache(userId, ['packages', 'notifications']);
 * ```
 */
export async function invalidateUserCache(
  userId: string,
  types: ('packages' | 'notifications' | 'profile' | 'delivery')[]
): Promise<void> {
  const promises: Promise<void>[] = [];

  if (types.includes('packages')) {
    promises.push(RedisCache.del(`${CacheKeys.PACKAGES}${userId}`));
  }
  
  if (types.includes('notifications')) {
    promises.push(RedisCache.del(`${CacheKeys.NOTIFICATIONS}${userId}`));
  }
  
  if (types.includes('profile')) {
    promises.push(RedisCache.del(`${CacheKeys.USER_PROFILE}${userId}`));
  }
  
  if (types.includes('delivery')) {
    promises.push(RedisCache.del(`${CacheKeys.DELIVERY_CODES}${userId}`));
  }

  await Promise.all(promises);
  console.log(`Invalidated cache for user ${userId}:`, types);
}
```

### 2. Create Cached Package Service

Create `src/services/cachedPackageService.ts`:

```typescript
// ============================================================================
// Cached Package Service
// ============================================================================
// Description: Package service with Redis caching
// Author: Senior Software Engineer
// Features: Cache-aside pattern, automatic invalidation
// ============================================================================

import { supabase } from '@/lib/supabase';
import { cacheAside, CacheKeys, CacheTTL, invalidateUserCache } from '@/lib/redis';
import type { Package } from '@/store/slices/packagesSlice';

/**
 * Cached Package Service
 * 
 * Implements cache-aside pattern for package operations
 * - Read operations use cache
 * - Write operations invalidate cache
 */
export class CachedPackageService {
  /**
   * Get user packages with caching
   * 
   * @param userId - User ID
   * @returns Array of packages
   */
  static async getPackages(userId: string): Promise<Package[]> {
    return cacheAside(
      `${CacheKeys.PACKAGES}${userId}`,
      CacheTTL.MEDIUM, // 5 minutes
      async () => {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      }
    );
  }

  /**
   * Update package status and invalidate cache
   * 
   * @param packageId - Package ID
   * @param status - New status
   * @param userId - User ID for cache invalidation
   */
  static async updateStatus(
    packageId: string,
    status: string,
    userId: string
  ): Promise<void> {
    // Update database
    const { error } = await supabase
      .from('packages')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', packageId);

    if (error) throw error;

    // Invalidate cache
    await invalidateUserCache(userId, ['packages']);
  }

  /**
   * Get package by ID with caching
   * 
   * @param packageId - Package ID
   * @returns Package data
   */
  static async getPackageById(packageId: string): Promise<Package> {
    return cacheAside(
      `package:${packageId}`,
      CacheTTL.LONG, // 30 minutes
      async () => {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('id', packageId)
          .single();

        if (error) throw error;
        return data;
      }
    );
  }
}
```

### 3. Environment Variables

Add to `.env`:

```bash
# Upstash Redis Configuration
VITE_UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
VITE_UPSTASH_REDIS_REST_TOKEN=your-token-here
```

---

## 📊 Caching Strategies

### 1. Cache-Aside (Lazy Loading)

```typescript
// Read: Check cache → Miss → Fetch DB → Cache result
const data = await cacheAside(key, ttl, fetchFunction);

// Write: Update DB → Invalidate cache
await updateDatabase();
await RedisCache.del(cacheKey);
```

**Use for**: Read-heavy workloads

### 2. Write-Through

```typescript
// Write: Update DB → Update cache immediately
await updateDatabase();
await RedisCache.set(cacheKey, newData, ttl);
```

**Use for**: Data consistency critical

### 3. Write-Behind

```typescript
// Write: Update cache → Queue DB update
await RedisCache.set(cacheKey, newData, ttl);
await queueDatabaseUpdate(data);
```

**Use for**: High-write workloads

---

## 🎯 Rate Limiting with Redis

```typescript
/**
 * Rate limiter using Redis
 * 
 * @param userId - User ID
 * @param limit - Max requests per window
 * @param window - Time window in seconds
 * @returns True if allowed
 */
export async function rateLimit(
  userId: string,
  limit: number = 100,
  window: number = 60
): Promise<boolean> {
  const key = `ratelimit:${userId}`;
  
  const count = await RedisCache.incr(key);
  
  if (count === 1) {
    await RedisCache.expire(key, window);
  }
  
  return count <= limit;
}

// Usage in API endpoint
if (!await rateLimit(userId, 100, 60)) {
  throw new Error('Rate limit exceeded');
}
```

---

## 📈 Monitoring & Analytics

### Cache Hit Rate

```typescript
export async function trackCacheMetrics(hit: boolean): Promise<void> {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  if (hit) {
    await RedisCache.incr(`metrics:cache:hits:${date}`);
  } else {
    await RedisCache.incr(`metrics:cache:misses:${date}`);
  }
}

export async function getCacheHitRate(date: string): Promise<number> {
  const hits = await RedisCache.get<number>(`metrics:cache:hits:${date}`) || 0;
  const misses = await RedisCache.get<number>(`metrics:cache:misses:${date}`) || 0;
  
  const total = hits + misses;
  return total > 0 ? (hits / total) * 100 : 0;
}
```

---

## 🛠️ Best Practices

### 1. Key Naming Convention
```typescript
// Format: {namespace}:{entity}:{id}:{field}
user:profile:123:settings
packages:user:456:list
api:response:endpoint:789
```

### 2. TTL Guidelines
- **User sessions**: 24 hours
- **API responses**: 5-30 minutes
- **Static data**: 1-24 hours
- **Real-time data**: 30-60 seconds

### 3. Cache Invalidation
```typescript
// Invalidate on mutations
await updateDatabase();
await invalidateUserCache(userId, ['packages']);

// Batch invalidation
await RedisCache.delPattern('packages:user:*');
```

### 4. Error Handling
```typescript
// Always handle Redis errors gracefully
try {
  const cached = await RedisCache.get(key);
  if (cached) return cached;
} catch (error) {
  console.error('Redis error, falling back to DB:', error);
}

// Fallback to database
return await fetchFromDatabase();
```

---

## 🚀 Performance Tips

1. **Use Pipeline for bulk operations**
```typescript
const pipeline = redis.pipeline();
pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
await pipeline.exec();
```

2. **Compress large values**
```typescript
import { compress, decompress } from 'lz-string';

const compressed = compress(JSON.stringify(largeObject));
await redis.set(key, compressed);
```

3. **Use appropriate data types**
- Strings: Simple values
- Hashes: Objects
- Lists: Arrays
- Sets: Unique values
- Sorted Sets: Ranked data

---

## 📊 Cost Optimization

### Upstash Pricing (as of 2024)
- **Free tier**: 10,000 commands/day
- **Pay-as-you-go**: $0.20 per 100k commands
- **No idle charges**
- **Global replication**: Optional

### Cost-saving tips:
1. Use appropriate TTLs
2. Compress large values
3. Use Redis data types efficiently
4. Monitor cache hit rate
5. Clean up unused keys

---

## ✅ Implementation Checklist

- [ ] Create Upstash Redis database
- [ ] Add environment variables
- [ ] Install @upstash/redis package
- [ ] Create Redis client utility
- [ ] Implement cache-aside pattern
- [ ] Add cache invalidation logic
- [ ] Test cache hit/miss scenarios
- [ ] Monitor cache performance
- [ ] Set up rate limiting
- [ ] Document caching strategy

---

## 🔗 Resources

- [Upstash Documentation](https://docs.upstash.com/)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Caching Strategies](https://aws.amazon.com/caching/best-practices/)

---

**Happy caching! ⚡️**
