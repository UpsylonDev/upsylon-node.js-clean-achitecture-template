import {
  Request,
  Response,
  // NextFunction
} from 'express';
import { ValidationError } from 'joi';
import { PinoLogger } from '../../infrastructure/logging/PinoLogger';

/**
 * Interface for custom HTTP errors.
 */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Centralized Express error handling middleware.
 * Catches all errors and returns an appropriate HTTP response.
 *
 * @param {Error} error - The caught error
 * @param {Request} req - The Express request
 * @param {Response} res - The Express response
 * @param {NextFunction} next - The Express next function
 */
export const errorHandler = (
  error: Error | HttpError | ValidationError,
  req: Request,
  res: Response
  // next: NextFunction
): void => {
  const logger = new PinoLogger({ context: 'ErrorHandler' });

  // Log the error with structured format
  logger.error('Error caught by error handler', error, {
    path: req.path,
    method: req.method,
    url: req.url,
  });

  // Handle Joi validation errors
  if (error instanceof ValidationError) {
    const details = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        statusCode: 400,
        details,
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
    return;
  }

  // Determine the HTTP status code
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (error instanceof HttpError) {
    statusCode = error.statusCode;
    message = error.message;
  } else {
    // Map business errors to appropriate HTTP codes
    message = error.message;

    if (message.includes('already exists')) {
      statusCode = 409; // Conflict
    } else if (
      message.includes('Invalid') ||
      message.includes('cannot be empty') ||
      message.includes('must be') ||
      message.includes('must contain')
    ) {
      statusCode = 400; // Bad Request
    } else if (message.includes('not found')) {
      statusCode = 404; // Not Found
    } else if (message.includes('Unauthorized')) {
      statusCode = 401; // Unauthorized
    } else if (message.includes('Forbidden')) {
      statusCode = 403; // Forbidden
    }
  }

  // Return the error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};

/**
 * Middleware to handle not found routes (404).
 *
 * @param {Request} req - The Express request
 * @param {Response} res - The Express response
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};
