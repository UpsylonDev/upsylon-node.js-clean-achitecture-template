import { createApp } from './app';
import { MongoConnection } from './infrastructure/persistence/mongoose/connection';
import { RedisConnection } from './infrastructure/persistence/redis/connection';
import { Environment } from './infrastructure/config/environment';
import { PinoLogger } from './infrastructure/logging/PinoLogger';

/**
 * Application entry point.
 * Configures and starts the Express server.
 */
const startServer = async (): Promise<void> => {
  const logger = new PinoLogger({ context: 'Server' });

  try {
    // 1. Validate environment variables
    logger.info('Validating environment variables');
    Environment.validate();

    // 2. Connect to MongoDB
    logger.info('Connecting to MongoDB');
    const mongoConnection = MongoConnection.getInstance();
    await mongoConnection.connect();

    // 3. Connect to Redis
    logger.info('Connecting to Redis');
    const redisConnection = RedisConnection.getInstance();
    await redisConnection.connect();

    // 4. Create the Express application
    logger.info('Creating Express application');
    const app = createApp();

    // 5. Start the server
    const port = Environment.PORT;
    app.listen(port, () => {
      logger.info('Server started successfully', {
        port,
        environment: Environment.NODE_ENV,
        logLevel: Environment.LOG_LEVEL,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Clean server shutdown handling
const logger = new PinoLogger({ context: 'ProcessHandlers' });

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', new Error(String(reason)), {
    promise: String(promise),
  });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

// Start the server
startServer();
