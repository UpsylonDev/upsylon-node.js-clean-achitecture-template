import mongoose from 'mongoose';
import { Environment } from '../../config/environment';
import { PinoLogger } from '../../logging/PinoLogger';

/**
 * Manages the MongoDB connection via Mongoose.
 * Singleton to ensure a single active connection.
 *
 * @class MongoConnection
 */
export class MongoConnection {
  private static instance: MongoConnection;
  private isConnected: boolean = false;
  private logger = new PinoLogger({ context: 'MongoConnection' });

  /**
   * Private constructor to prevent direct instantiation.
   * @private
   */
  private constructor() {}

  /**
   * Returns the unique instance of MongoConnection.
   *
   * @returns {MongoConnection} The singleton instance
   */
  public static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  /**
   * Establishes the MongoDB connection.
   *
   * @returns {Promise<void>}
   * @throws {Error} If the connection fails
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      this.logger.info('MongoDB already connected');
      return;
    }

    try {
      await mongoose.connect(Environment.MONGODB_URI, {
        tls: Environment.isProduction(),
        tlsAllowInvalidCertificates: false,
      });

      this.isConnected = true;

      this.logger.info('MongoDB connected successfully');

      // Connection event handling
      mongoose.connection.on('error', (error) => {
        this.logger.error('MongoDB connection error', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        this.logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      // Clean shutdown handling
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error);
      throw new Error('Database connection failed');
    }
  }

  /**
   * Closes the MongoDB connection.
   *
   * @returns {Promise<void>}
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      this.logger.info('MongoDB connection closed');
    } catch (error) {
      this.logger.error('Error closing MongoDB connection', error);
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
}
