import { Router } from 'express';
import { ExtraApiController } from '../controllers/ExtraApiController';
import { FetchExternalDataCommandHandler } from '../../application/commands/FetchExternalDataCommandHandler';
import { ExternalDataServiceImpl } from '../../infrastructure/services/ExternalDataServiceImpl';
import { ExternalApiConfig } from '../../infrastructure/config/externalApiConfig';
import { RedisCacheRepository } from '../../infrastructure/persistence/RedisCacheRepository';
import { RedisConnection } from '../../infrastructure/persistence/redis/connection';

/**
 * Factory function to create the external API router.
 * Implements dependency injection for all required components.
 *
 * @returns Express router configured with external API routes
 */
export const getExtraApiRouter = (): Router => {
  const router = Router();

  // 1. Create configuration from environment
  const externalApiConfig = ExternalApiConfig.fromEnvironment();

  // 2. Create infrastructure dependencies
  const externalDataService = new ExternalDataServiceImpl(externalApiConfig);
  const redisConnection = RedisConnection.getInstance();
  const cacheRepository = new RedisCacheRepository(redisConnection);

  // 3. Create application handler with dependencies
  const fetchDataHandler = new FetchExternalDataCommandHandler(
    externalDataService,
    cacheRepository
  );

  // 4. Create controller with handler
  const extraApiController = new ExtraApiController(fetchDataHandler);

  // 5. Register routes
  router.get('/', extraApiController.getExtraData);

  return router;
};
