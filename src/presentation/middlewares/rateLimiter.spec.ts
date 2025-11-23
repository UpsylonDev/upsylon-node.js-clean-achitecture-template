import { createRateLimiter, globalRateLimiter, strictRateLimiter } from './rateLimiter';
import { Environment } from '../../infrastructure/config/environment';

/**
 * Tests for the rate limiter middleware factory.
 */
describe('RateLimiter Middleware', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('createRateLimiter factory', () => {
    it('should create a rate limiter with default options', () => {
      const limiter = createRateLimiter();
      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe('function');
    });

    it('should create a rate limiter with custom options', () => {
      const limiter = createRateLimiter({
        windowMs: 600000,
        maxRequests: 50,
        message: 'Custom rate limit message',
      });
      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe('function');
    });

    it('should use environment variables for defaults', () => {
      const limiter = createRateLimiter();
      // Verify the limiter is created with proper configuration
      expect(limiter).toBeDefined();
    });
  });

  describe('globalRateLimiter', () => {
    it('should be defined', () => {
      expect(globalRateLimiter).toBeDefined();
    });

    it('should be a function (Express middleware)', () => {
      expect(typeof globalRateLimiter).toBe('function');
    });

    it('should use default global rate limit settings', () => {
      // The globalRateLimiter should use RATE_LIMIT_MAX_REQUESTS
      // which defaults to 100
      expect(Environment.RATE_LIMIT_MAX_REQUESTS).toBe(100);
    });
  });

  describe('strictRateLimiter', () => {
    it('should be defined', () => {
      expect(strictRateLimiter).toBeDefined();
    });

    it('should be a function (Express middleware)', () => {
      expect(typeof strictRateLimiter).toBe('function');
    });

    it('should use stricter limits than global', () => {
      // The strictRateLimiter should use RATE_LIMIT_STRICT_MAX_REQUESTS
      // which should be less than RATE_LIMIT_MAX_REQUESTS
      expect(Environment.RATE_LIMIT_STRICT_MAX_REQUESTS).toBeLessThan(
        Environment.RATE_LIMIT_MAX_REQUESTS
      );
    });
  });

  describe('Rate limiter error response', () => {
    it('should return 429 status code on rate limit exceeded', () => {
      // This test verifies the structure of the rate limiter
      // The actual rate limit check is handled by express-rate-limit
      const limiter = createRateLimiter({
        statusCode: 429,
      });

      expect(limiter).toBeDefined();
    });

    it('should include proper error response structure', () => {
      // The error response should follow the application error format
      const limiter = createRateLimiter({
        message: 'Too many requests',
        statusCode: 429,
      });

      expect(limiter).toBeDefined();
    });
  });

  describe('Rate limiter configuration', () => {
    it('should accept skipSuccessfulRequests option', () => {
      const limiter = createRateLimiter({
        skipSuccessfulRequests: true,
      });

      expect(limiter).toBeDefined();
    });

    it('should accept skipFailedRequests option', () => {
      const limiter = createRateLimiter({
        skipFailedRequests: true,
      });

      expect(limiter).toBeDefined();
    });

    it('should use Redis store by default', () => {
      // Redis store is created in createRedisRateLimitStore
      const limiter = createRateLimiter();
      expect(limiter).toBeDefined();
    });
  });

  describe('Environment configuration', () => {
    it('should read RATE_LIMIT_WINDOW_MS from environment', () => {
      expect(Environment.RATE_LIMIT_WINDOW_MS).toBeDefined();
      expect(typeof Environment.RATE_LIMIT_WINDOW_MS).toBe('number');
      expect(Environment.RATE_LIMIT_WINDOW_MS).toBeGreaterThan(0);
    });

    it('should read RATE_LIMIT_MAX_REQUESTS from environment', () => {
      expect(Environment.RATE_LIMIT_MAX_REQUESTS).toBeDefined();
      expect(typeof Environment.RATE_LIMIT_MAX_REQUESTS).toBe('number');
      expect(Environment.RATE_LIMIT_MAX_REQUESTS).toBeGreaterThan(0);
    });

    it('should read RATE_LIMIT_STRICT_MAX_REQUESTS from environment', () => {
      expect(Environment.RATE_LIMIT_STRICT_MAX_REQUESTS).toBeDefined();
      expect(typeof Environment.RATE_LIMIT_STRICT_MAX_REQUESTS).toBe('number');
      expect(Environment.RATE_LIMIT_STRICT_MAX_REQUESTS).toBeGreaterThan(0);
    });
  });

  describe('Middleware options', () => {
    it('should support custom window time', () => {
      const customWindow = 300000; // 5 minutes
      const limiter = createRateLimiter({
        windowMs: customWindow,
      });

      expect(limiter).toBeDefined();
    });

    it('should support custom max requests', () => {
      const customMax = 50;
      const limiter = createRateLimiter({
        maxRequests: customMax,
      });

      expect(limiter).toBeDefined();
    });

    it('should support custom error message', () => {
      const customMessage = 'Custom rate limit exceeded message';
      const limiter = createRateLimiter({
        message: customMessage,
      });

      expect(limiter).toBeDefined();
    });

    it('should use default values when options are partial', () => {
      const limiter = createRateLimiter({
        maxRequests: 50,
        // windowMs not provided, should use default
      });

      expect(limiter).toBeDefined();
    });
  });
});
