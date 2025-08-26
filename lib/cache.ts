interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache {
  private storage = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Clean expired entries first
    this.cleanup();

    // If cache is full, remove oldest entry
    if (this.storage.size >= this.maxSize) {
      const oldestKey = this.storage.keys().next().value;
      if (oldestKey) {
        this.storage.delete(oldestKey);
      }
    }

    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.storage.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.storage.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  size(): number {
    this.cleanup();
    return this.storage.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.storage.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    this.cleanup();
    return {
      size: this.storage.size,
      maxSize: this.maxSize,
      keys: Array.from(this.storage.keys())
    };
  }
}

// Create a singleton cache instance
export const distanceCache = new Cache(200);

// Cache key generator for distance calculations
export function generateCacheKey(countries: string[]): string {
  return `distances:${countries.sort().join(',')}`;
}

// Cache key generator for country data
export const COUNTRIES_CACHE_KEY = 'countries:all';
export const COUNTRIES_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
