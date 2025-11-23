/**
 * Logger interface following DDD principles.
 * Abstraction for logging that decouples application from concrete logger implementation.
 */
export interface ILogger {
  /**
   * Log informational message
   */
  info(message: string, data?: Record<string, unknown>): void;

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, unknown>): void;

  /**
   * Log error message with optional error object
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;

  /**
   * Log debug message (only in development)
   */
  debug(message: string, data?: Record<string, unknown>): void;

  /**
   * Log trace message (very verbose)
   */
  trace(message: string, data?: Record<string, unknown>): void;

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, unknown>): ILogger;
}
