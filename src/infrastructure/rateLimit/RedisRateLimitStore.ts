import RedisStore from 'rate-limit-redis';
import { RedisConnection } from '../persistence/redis/connection';
import { PinoLogger } from '../logging/PinoLogger';
import type { Redis } from 'ioredis';

const logger = new PinoLogger({ context: 'RedisRateLimitStore' });

/**
 * Factory pour créer un store Redis pour express-rate-limit.
 * Réutilise la connexion Redis existante de l'application.
 *
 * Cette fonction retourne un store compatible avec express-rate-limit
 * qui utilise Redis pour la persistance du rate limiting en multi-instances.
 *
 * Fallback gracieux au store mémoire si Redis n'est pas disponible.
 *
 * @returns Store Redis configuré ou undefined pour utiliser le store mémoire par défaut
 */
export const createRedisRateLimitStore = () => {
  try {
    const redisConnection = RedisConnection.getInstance();
    const status = redisConnection.getConnectionStatus();

    // Vérifier que Redis est connecté avant de créer le store
    if (!status) {
      logger.trace('Redis client is not ready, using memory store for rate limiting');
      return undefined;
    }

    const redisClient: Redis = redisConnection.getClient();

    // rate-limit-redis expects sendCommand method compatible with redis client
    return new RedisStore({
      sendCommand: async (cmd: string, ...args: (string | number | Buffer)[]) => {
        const result = await redisClient.call(cmd, ...args);
        // rate-limit-redis expects a specific RedisReply type, but ioredis returns unknown/any
        // We can safely cast here as we know ioredis returns compatible types
        return result as import('rate-limit-redis').RedisReply;
      },
      prefix: 'rate-limit:',
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.trace('Failed to create Redis store for rate limiting', {
      message: err.message,
    });
    // En cas d'erreur, retourner undefined pour que express-rate-limit
    // utilise le store en mémoire par défaut
    return undefined;
  }
};
