import { RedisConnection } from './redis/connection';
import { Environment } from '../config/environment';
import { PinoLogger } from '../logging/PinoLogger';

/**
 * Generic cache repository interface using Redis.
 * Provides a contract for caching operations.
 */
export interface ICacheRepository {
  /**
   * Retrieves a value from cache.
   *
   * @template T The type of the cached value
   * @param {string} key The cache key
   * @returns {Promise<T | null>} The cached value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Stores a value in cache.
   *
   * @template T The type of the value to cache
   * @param {string} key The cache key
   * @param {T} value The value to cache
   * @param {number} [ttl] Time to live in seconds (optional, uses default if not provided)
   * @returns {Promise<void>}
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Deletes a value from cache.
   *
   * @param {string} key The cache key
   * @returns {Promise<void>}
   */
  delete(key: string): Promise<void>;

  /**
   * Checks if a key exists in cache.
   *
   * @param {string} key The cache key
   * @returns {Promise<boolean>} True if the key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Flushes the entire cache database.
   * Useful for testing and cleanup.
   *
   * @returns {Promise<void>}
   */
  flush(): Promise<void>;
}

/**
 * Redis-based cache repository implementation.
 * Implements the Cache-Aside pattern for caching.
 *
 * @class RedisCacheRepository
 * @implements {ICacheRepository}
 */
export class RedisCacheRepository implements ICacheRepository {
  private redisConnection: RedisConnection;
  private defaultTTL: number;
  private logger = new PinoLogger({ context: 'RedisCacheRepository' });

  /**
   * Creates an instance of RedisCacheRepository.
   *
   * @param {RedisConnection} [redisConnection] The Redis connection instance
   * @param {number} [defaultTTL] Default TTL in seconds
   */
  constructor(
    redisConnection: RedisConnection = RedisConnection.getInstance(),
    defaultTTL: number = Environment.REDIS_TTL
  ) {
    this.redisConnection = redisConnection;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Retrieves a value from cache.
   * Automatically deserializes JSON strings.
   *
   * @template T The type of the cached value
   * @param {string} key The cache key
   * @returns {Promise<T | null>} The cached value or null if not found
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const client = this.redisConnection.getClient();
      const cachedValue = await client.get(key);

      if (!cachedValue) {
        this.logger.debug('Cache miss', { key });
        return null;
      }

      this.logger.debug('Cache hit', { key });

      // Attempt to parse as JSON, fallback to string
      try {
        return JSON.parse(cachedValue) as T;
      } catch {
        return cachedValue as unknown as T;
      }
    } catch (error) {
      this.logger.error(`Error retrieving cache for key "${key}"`, error);
      return null;
    }
  }

  /**
   * Stores a value in cache.
   * Automatically serializes objects to JSON.
   *
   * @template T The type of the value to cache
   * @param {string} key The cache key
   * @param {T} value The value to cache
   * @param {number} [ttl] Time to live in seconds (uses default if not provided)
   * @returns {Promise<void>}
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const client = this.redisConnection.getClient();
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      const cacheKey = key;
      const expireTTL = ttl ?? this.defaultTTL;

      if (expireTTL > 0) {
        await client.setex(cacheKey, expireTTL, serializedValue);
      } else {
        await client.set(cacheKey, serializedValue);
      }

      this.logger.debug('Cache set', { key, ttl: expireTTL });
    } catch (error) {
      this.logger.error(`Error setting cache for key "${key}"`, error);
      throw error;
    }
  }

  /**
   * Deletes a value from cache.
   *
   * @param {string} key The cache key
   * @returns {Promise<void>}
   */
  public async delete(key: string): Promise<void> {
    try {
      const client = this.redisConnection.getClient();
      await client.del(key);
      this.logger.debug('Cache deleted', { key });
    } catch (error) {
      this.logger.error(`Error deleting cache for key "${key}"`, error);
      throw error;
    }
  }

  /**
   * Checks if a key exists in cache.
   *
   * @param {string} key The cache key
   * @returns {Promise<boolean>} True if the key exists
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const client = this.redisConnection.getClient();
      const result = await client.exists(key);
      this.logger.debug('Cache existence check', { key, exists: result === 1 });
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking cache existence for key "${key}"`, error);
      return false;
    }
  }

  /**
   * Flushes the entire cache database.
   * Useful for testing and cleanup.
   *
   * @returns {Promise<void>}
   */
  public async flush(): Promise<void> {
    try {
      await this.redisConnection.flushDatabase();
      this.logger.info('Cache flushed');
    } catch (error) {
      this.logger.error('Error flushing cache', error);
      throw error;
    }
  }
}
