import { Request, Response } from 'express';
import rateLimit, { RateLimitRequestHandler, ipKeyGenerator } from 'express-rate-limit';
import { Environment } from '../../infrastructure/config/environment';
import { createRedisRateLimitStore } from '../../infrastructure/rateLimit/RedisRateLimitStore';
import { PinoLogger } from '../../infrastructure/logging/PinoLogger';

const logger = new PinoLogger({ context: 'RateLimiter' });

/**
 * Options configurables pour le rate limiter.
 */
interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Factory pour créer un middleware de rate limiting configurable.
 * Utilise Redis pour la persistance en multi-instances (scalable).
 * Tombe en dégradation gracieuse sur un store mémoire si Redis n'est pas disponible.
 *
 * @param options Configuration optionnelle du rate limiter
 * @returns Middleware Express pour le rate limiting
 */
export const createRateLimiter = (
  options?: RateLimiterOptions
): RateLimitRequestHandler => {
  const windowMs = options?.windowMs || Environment.RATE_LIMIT_WINDOW_MS;
  const maxRequests = options?.maxRequests || Environment.RATE_LIMIT_MAX_REQUESTS;
  const message = options?.message || 'Too many requests, please try again later.';
  const statusCode = options?.statusCode || 429;
  const skipSuccessfulRequests = options?.skipSuccessfulRequests ?? false;
  const skipFailedRequests = options?.skipFailedRequests ?? false;

  logger.trace('Creating rate limiter');

  const redisStore = createRedisRateLimitStore();

  const limiter = rateLimit({
    store: redisStore,
    windowMs,
    limit: maxRequests,
    message,
    statusCode,
    standardHeaders: true, // Retourne RateLimit-* headers
    legacyHeaders: false, // Désactive X-RateLimit-* headers
    keyGenerator: (req: Request) => ipKeyGenerator(req.ip || ''),
    skip: () => {
      // Skip rate limiting based on conditions
      if (skipSuccessfulRequests || skipFailedRequests) {
        return true;
      }
      return false;
    },
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });

      res.status(statusCode).json({
        success: false,
        error: {
          message,
          statusCode,
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    },
  });

  return limiter;
};

/**
 * Rate limiter global pour toutes les routes.
 * Limite générale pour protéger l'application contre les abus.
 * Par défaut : 100 requêtes par 15 minutes par IP.
 */
export const globalRateLimiter = createRateLimiter();

/**
 * Rate limiter strict pour les endpoints sensibles (POST, authentication, etc.).
 * Limite plus restrictive pour prévenir les attaques de brute-force.
 * Par défaut : 10 requêtes par 15 minutes par IP.
 */
export const strictRateLimiter = createRateLimiter({
  maxRequests: Environment.RATE_LIMIT_STRICT_MAX_REQUESTS,
  message: 'Too many requests to this endpoint, please try again later.',
});
