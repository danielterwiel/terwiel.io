import type { Domain, Project } from "~/types";

/**
 * Simple in-memory cache for filter results
 * Prevents redundant filtering operations
 *
 * Cache key: `${query}|${domain ?? ''}`
 * Max size: 50 entries (queries are temporary)
 */
class FilterCache {
  private cache = new Map<string, Project[]>();
  private maxSize = 50;

  private getCacheKey(query: string, domain?: Domain): string {
    return `${query}|${domain ?? ""}`;
  }

  get(query: string, domain?: Domain): Project[] | undefined {
    return this.cache.get(this.getCacheKey(query, domain));
  }

  set(query: string, domain: Domain | undefined, results: Project[]): void {
    const key = this.getCacheKey(query, domain);

    // LRU: delete oldest entry if at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value as string;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, results);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const filterCache = new FilterCache();
