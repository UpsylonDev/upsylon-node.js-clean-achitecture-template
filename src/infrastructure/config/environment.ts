import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

/**
 * Configuration de l'application depuis les variables d'environnement.
 * Centralise toutes les variables de configuration.
 *
 * @class Environment
 */
export class Environment {
  /**
   * Port du serveur.
   */
  public static readonly PORT: number = parseInt(process.env.PORT || '3000', 10);

  /**
   * Environnement d'exécution.
   */
  public static readonly NODE_ENV: string = process.env.NODE_ENV || 'development';

  /**
   * URI de connexion MongoDB.
   */
  public static readonly MONGODB_URI: string =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/ddd-user-api';

  /**
   * Nombre de rounds de salt pour bcrypt.
   */
  public static readonly BCRYPT_SALT_ROUNDS: number = parseInt(
    process.env.BCRYPT_SALT_ROUNDS || '10',
    10
  );

  /**
   * Clé secrète Stripe.
   */
  public static readonly STRIPE_SECRET_KEY: string = process.env.STRIPE_SECRET_KEY || '';

  /**
   * Secret du webhook Stripe.
   */
  public static readonly STRIPE_WEBHOOK_SECRET: string =
    process.env.STRIPE_WEBHOOK_SECRET || '';

  /**
   * Host Redis.
   */
  public static readonly REDIS_HOST: string = process.env.REDIS_HOST || 'localhost';

  /**
   * Port Redis.
   */
  public static readonly REDIS_PORT: number = parseInt(
    process.env.REDIS_PORT || '6379',
    10
  );

  /**
   * Mot de passe Redis (optionnel).
   */
  public static readonly REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || '';

  /**
   * Numéro de base de données Redis.
   */
  public static readonly REDIS_DB: number = parseInt(process.env.REDIS_DB || '0', 10);

  /**
   * TTL par défaut pour le cache Redis (en secondes).
   */
  public static readonly REDIS_TTL: number = parseInt(
    process.env.REDIS_TTL || '3600',
    10
  );

  /**
   * Niveau de log (debug, info, warn, error).
   */
  public static readonly LOG_LEVEL: string = process.env.LOG_LEVEL || 'debug';

  /**
   * Fenêtre de time pour le rate limiting global (en millisecondes).
   */
  public static readonly RATE_LIMIT_WINDOW_MS: number = parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || '900000',
    10
  );

  /**
   * Nombre maximum de requêtes par fenêtre pour le rate limiting global.
   */
  public static readonly RATE_LIMIT_MAX_REQUESTS: number = parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || '100',
    10
  );

  /**
   * Nombre maximum de requêtes pour le rate limiting strict (POST endpoints).
   */
  public static readonly RATE_LIMIT_STRICT_MAX_REQUESTS: number = parseInt(
    process.env.RATE_LIMIT_STRICT_MAX_REQUESTS || '10',
    10
  );

  /**
   * Vérifie que toutes les variables d'environnement requises sont présentes.
   *
   * @throws {Error} Si une variable requise est manquante
   */
  public static validate(): void {
    const requiredVars = ['MONGODB_URI'];
    // Require Stripe secrets in production
    if (Environment.isProduction()) {
      requiredVars.push('STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET');
    }

    const missingVars = requiredVars.filter((varName) => {
      const value = process.env[varName];
      return !value || value.trim().length === 0;
    });

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }
  }

  /**
   * Indique si l'application est en mode production.
   */
  public static isProduction(): boolean {
    return Environment.NODE_ENV === 'production';
  }

  /**
   * Indique si l'application est en mode développement.
   */
  public static isDevelopment(): boolean {
    return Environment.NODE_ENV === 'development';
  }
}
