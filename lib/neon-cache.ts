interface CacheEntry {
  data: any;
  timestamp: number;
}

class TaskCache {
  private cache: Map<string, CacheEntry> = new Map();
  private TTL = 30000; // 30 seconds

  set(userId: string, data: any): void {
    this.cache.set(userId, {
      data,
      timestamp: Date.now()
    });
  }

  get(userId: string): any | null {
    const entry = this.cache.get(userId);
    
    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    
    if (age > this.TTL) {
      this.cache.delete(userId);
      return null;
    }

    return entry.data;
  }

  invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const taskCache = new TaskCache();
