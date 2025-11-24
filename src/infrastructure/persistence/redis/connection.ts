import Redis from 'ioredis';
import { Environment } from '../../config/environment';
import { PinoLogger } from '../../logging/PinoLogger';

/**
 * Manages the Redis connection.
 * Singleton to ensure a single active connection.
 *
 * @class RedisConnection
 */
export class RedisConnection {
  private static instance: RedisConnection;
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private logger = new PinoLogger({ context: 'RedisConnection' });

  /**
   * Private constructor to prevent direct instantiation.
   * @private
   */
  private constructor() {}

  /**
   * Returns the unique instance of RedisConnection.
   *
   * @returns {RedisConnection} The singleton instance
   */
  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }

  /**
   * Establishes the Redis connection.
   *
   * @returns {Promise<void>}
   * @throws {Error} If the connection fails
   */
  public async connect(): Promise<void> {
    if (this.isConnected || this.client) {
      this.logger.info('Redis already connected');
      return;
    }

    try {
      this.client = new Redis({
        host: Environment.REDIS_HOST,
        port: Environment.REDIS_PORT,
        password: Environment.REDIS_PASSWORD || undefined,
        db: Environment.REDIS_DB,
        // Enable TLS in production
        tls: Environment.isProduction() ? {} : undefined,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      // Wait for successful connection
      await this.client.ping();

      this.isConnected = true;

      this.logger.info('Redis connected successfully');

      // Connection event handling
      this.client.on('error', (error: Error) => {
        this.logger.error('Redis connection error', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        this.logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        this.logger.warn('Redis attempting to reconnect');
      });

      // Clean shutdown handling
      process.on('SIGINT', async () => {
        await this.disconnect();
      });
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      throw new Error('Redis connection failed');
    }
  }

  /**
   * Returns the Redis client instance.
   *
   * @returns {Redis} The Redis client
   * @throws {Error} If Redis is not connected
   */
  public getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }
    return this.client;
  }

  /**
   * Closes the Redis connection.
   *
   * @returns {Promise<void>}
   */
  public async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.quit();
      this.isConnected = false;
      this.client = null;
      this.logger.info('Redis connection closed');
    } catch (error) {
      this.logger.error('Error closing Redis connection', error);
      throw error;
    }
  }

  /**
   * Checks if the connection is active.
   *
   * @returns {boolean} True if connected
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Flushes the entire database (use with caution).
   * Useful for testing and cleanup.
   *
   * @returns {Promise<void>}
   */
  public async flushDatabase(): Promise<void> {
    const client = this.getClient();
    try {
      await client.flushdb();
      this.logger.info('Redis database flushed');
    } catch (error) {
      this.logger.error('Error flushing Redis database', error);
      throw error;
    }
  }
}
