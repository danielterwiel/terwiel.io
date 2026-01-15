/**
 * Filter Cache Module
 *
 * Provides an LRU (Least Recently Used) cache for project filter results.
 * Prevents redundant filtering operations when the same query is repeated.
 *
 * @see filterProjects in src/utils/filter-projects.ts for the filtering logic
 */

import type { Domain, Project } from "~/types";

/**
 * LRU (Least Recently Used) cache for project filter results
 *
 * Prevents redundant filtering operations by caching results keyed by
 * query and domain combination. Uses a simple LRU eviction strategy
 * with a maximum of 50 entries.
 *
 * ## Cache Key Format
 * `${query}|${domain ?? ''}`
 *
 * ## Eviction Strategy
 * When the cache reaches max size (50), the oldest entry is deleted
 * before adding a new one (LRU approximation using Map insertion order).
 *
 * @example
 * ```ts
 * // Check cache
 * const cached = filterCache.get("React", "Front-end");
 * if (cached) return cached;
 *
 * // Store result
 * const results = filterProjects(projects, "React", "Front-end");
 * filterCache.set("React", "Front-end", results);
 * ```
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

/**
 * Singleton instance of the filter cache
 *
 * Import and use this instance throughout the application:
 * ```ts
 * import { filterCache } from "~/utils/filter-cache";
 * ```
 */
export const filterCache = new FilterCache();
