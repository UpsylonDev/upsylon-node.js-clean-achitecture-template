import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createUserRouter } from './presentation/routes/userRoutes';
import { getExtraApiRouter } from './presentation/routes/extraRoutes';
import { errorHandler, notFoundHandler } from './presentation/middlewares/errorHandler';
import { createHttpLogger } from './infrastructure/logging/httpLogger';
import { globalRateLimiter } from './presentation/middlewares/rateLimiter';
import { mountMetrics, metricsMiddleware } from './infrastructure/monitoring/metrics';

/**
 * Configures and returns the Express application.
 * Separates app configuration from server startup for easier testing.
 *
 * @returns {Application} The configured Express application
 */
export const createApp = (): Application => {
  const app = express();

  // Global middlewares
  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
      },
    })
  );

  // CORS configuration (restrict origins in production)
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
    })
  );

  // Request size limits
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Disable Express default header
  app.disable('x-powered-by');

  // HTTP logger middleware (logs all requests/responses)
  app.use(createHttpLogger());

  // Metrics middleware
  app.use(metricsMiddleware);

  // Rate limiting middleware (protects against abuse)
  app.use(globalRateLimiter);

  // Routes
  app.use('/users', createUserRouter());
  app.use('/extra-api', getExtraApiRouter());

  // Health route
  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: '*** OK :  Server is running ***',
      timestamp: new Date().toISOString(),
    });
  });

  // Metrics route
  mountMetrics(app);

  // 404 middleware (must be before errorHandler)
  app.use(notFoundHandler);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};
