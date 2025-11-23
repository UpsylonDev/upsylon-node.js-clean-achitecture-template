import pino, { Logger as PinoLoggerType } from 'pino';
import { ILogger } from './ILogger';
import { Environment } from '../config/environment';

/**
 * Pino logger implementation.
 * Provides structured JSON logging with performance optimization.
 * Supports pretty printing in development mode.
 */
export class PinoLogger implements ILogger {
  private logger: PinoLoggerType;

  constructor(context?: Record<string, unknown>) {
    const isDevelopment = Environment.isDevelopment();
    const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

    const config: pino.LoggerOptions = {
      level: logLevel,
      timestamp: true,
      ...(isDevelopment && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        },
      }),
    };

    this.logger = pino(config);

    if (context) {
      this.logger = this.logger.child(context);
    }
  }

  /**
   * Log informational message
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.logger.info(data || {}, message);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.logger.warn(data || {}, message);
  }

  /**
   * Log error message with optional error object
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    if (error instanceof Error) {
      this.logger.error(
        {
          ...data,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        },
        message
      );
    } else if (error) {
      this.logger.error({ ...data, error }, message);
    } else {
      this.logger.error(data || {}, message);
    }
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.logger.debug(data || {}, message);
  }

  /**
   * Log trace message (very verbose)
   */
  trace(message: string, data?: Record<string, unknown>): void {
    this.logger.trace(data || {}, message);
  }

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, unknown>): ILogger {
    return new PinoLogger(context);
  }
}
