/**
 * Interface for cache repository.
 * Defines the contract for caching operations.
 *
 * This interface follows the Dependency Inversion Principle:
 * - Domain/Application layer defines the contract
 * - Infrastructure layer provides implementation
 */
export interface ICacheRepository {
  /**
   * Retrieves a value from the cache.
   *
   * @param key - The cache key
   * @returns Promise resolving to the cached value or null if not found
   */
  get(key: string): Promise<unknown | null>;

  /**
   * Stores a value in the cache.
   *
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Optional time-to-live in seconds
   * @returns Promise resolving when the value is stored
   */
  set(key: string, value: unknown, ttl?: number): Promise<void>;

  /**
   * Removes a value from the cache.
   *
   * @param key - The cache key
   * @returns Promise resolving when the value is removed
   */
  delete(key: string): Promise<void>;
}
