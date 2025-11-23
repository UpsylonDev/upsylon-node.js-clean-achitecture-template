# Guide d'Implémentation : API Externe avec Cache Redis

Ce document explique étape par étape comment implémenter un endpoint qui appelle une API externe en respectant les principes DDD et Clean Architecture.

## 🎯 Objectif

Créer une route `GET /extra-api` qui :
- Appelle une URL externe configurée
- Utilise Redis pour mettre en cache les réponses (Cache-Aside pattern)
- Respecte l'architecture en couches DDD

---

## 📚 Rappel : Les 4 Couches de l'Architecture

```
┌─────────────────────────────────────┐
│   PRESENTATION (Controllers)        │  ← HTTP : Controllers, Routes, Middlewares
├─────────────────────────────────────┤
│   APPLICATION (Use Cases)           │  ← Logique métier : Commands, Handlers
├─────────────────────────────────────┤
│   DOMAIN (Business Logic)           │  ← Règles métier : Entities, Value Objects, Interfaces
├─────────────────────────────────────┤
│   INFRASTRUCTURE (Technical)        │  ← Détails techniques : DB, APIs externes, Config
└─────────────────────────────────────┘
```

**Principe clé** : Les dépendances pointent **vers le bas** (Presentation → Application → Domain ← Infrastructure).

---

## 🔨 Étape 1 : Configuration (Infrastructure)

### Fichier créé
`src/infrastructure/config/externalApiConfig.ts`

### Objectif
Gérer la configuration de l'API externe de manière injectable et testable.

### Code
```typescript
/**
 * Configuration for external API integration.
 * This class provides injectable configuration for calling external services.
 */
export class ExternalApiConfig {
  /**
   * External API URL (complete URL including protocol).
   */
  public readonly apiUrl: string;

  /**
   * Request timeout in milliseconds.
   */
  public readonly timeout: number;

  /**
   * Creates a new ExternalApiConfig instance.
   *
   * @param apiUrl - The complete URL of the external API
   * @param timeout - Request timeout in milliseconds (default: 5000ms)
   * @throws Error if apiUrl is not provided
   */
  constructor(apiUrl?: string, timeout: number = 5000) {
    if (!apiUrl || apiUrl.trim() === '') {
      throw new Error('EXTRA_API_KEY environment variable must be defined');
    }

    this.apiUrl = apiUrl;
    this.timeout = timeout;
  }

  /**
   * Creates an ExternalApiConfig from environment variables.
   *
   * @returns A new ExternalApiConfig instance
   */
  public static fromEnvironment(): ExternalApiConfig {
    return new ExternalApiConfig(process.env.EXTRA_API_KEY);
  }
}
```

### Pourquoi cette approche ?
- ✅ **Injectable** : Pas de classe statique, facilite les tests
- ✅ **Validation** : Vérifie que l'URL est définie au démarrage
- ✅ **Séparation** : Configuration dédiée, pas mélangée avec d'autres configs
- ✅ **Extensible** : Facile d'ajouter d'autres paramètres (headers, retry, etc.)

### Configuration requise
```env
# .env
EXTRA_API_KEY=https://api.example.com/data
```

---

## 🔨 Étape 2 : Interface Domain (Contrat)

### Fichier créé
`src/domain/services/IExternalDataService.ts`

### Objectif
Définir le **contrat** (interface) que l'infrastructure devra implémenter.

### Code
```typescript
/**
 * Interface for external data service.
 * Defines the contract for fetching data from external APIs.
 *
 * This interface follows the Dependency Inversion Principle:
 * - Domain layer defines the contract
 * - Infrastructure layer provides implementation
 */
export interface IExternalDataService {
  /**
   * Fetches data from the external API.
   *
   * @returns Promise resolving to the API response data
   * @throws Error if the external API call fails
   */
  fetchData(): Promise<unknown>;
}
```

### Pourquoi cette approche ?
- ✅ **Dependency Inversion Principle** : Le Domain définit le "quoi", pas le "comment"
- ✅ **Aucune dépendance technique** : Pas d'import Axios, HTTP, etc.
- ✅ **Testabilité** : Facile de créer des mocks pour les tests
- ✅ **Contrat simple** : Une seule responsabilité claire

---

## 🔨 Étape 3 : Service Infrastructure (Implémentation)

### Fichier créé
`src/infrastructure/services/ExternalDataServiceImpl.ts`

### Objectif
Implémenter le contrat défini par le Domain en utilisant Axios.

### Code
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { IExternalDataService } from '../../domain/services/IExternalDataService';
import { ExternalApiConfig } from '../config/externalApiConfig';
import { PinoLogger } from '../logging/PinoLogger';

/**
 * Implementation of IExternalDataService using Axios.
 * Handles HTTP communication with external APIs.
 */
export class ExternalDataServiceImpl implements IExternalDataService {
  private readonly axiosInstance: AxiosInstance;
  private readonly logger: PinoLogger;

  /**
   * Creates a new ExternalDataServiceImpl instance.
   *
   * @param config - Configuration for the external API
   */
  constructor(private readonly config: ExternalApiConfig) {
    this.logger = new PinoLogger({ context: 'ExternalDataService' });

    this.axiosInstance = axios.create({
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  /**
   * Fetches data from the external API using HTTP GET.
   *
   * @returns Promise resolving to the API response data
   * @throws Error if the external API call fails
   */
  public async fetchData(): Promise<unknown> {
    try {
      this.logger.info('Fetching data from external API');

      const response = await this.axiosInstance.get(this.config.apiUrl);

      this.logger.info('Data fetched successfully from external API', {
        status: response.status,
      });

      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        this.logger.error('External API request failed', error, {
          status: error.response?.status,
          message: error.message,
        });

        throw new Error(
          `External API request failed: ${error.response?.status || error.message}`,
        );
      }

      this.logger.error('Unexpected error during external API call', error);
      throw new Error('Failed to fetch data from external API');
    }
  }

  /**
   * Type guard to check if error is an Axios error.
   *
   * @param error - The error to check
   * @returns True if the error is an AxiosError
   */
  private isAxiosError(error: unknown): error is AxiosError {
    return axios.isAxiosError(error);
  }
}
```

### Pourquoi cette approche ?
- ✅ **Implémente l'interface** : Respecte le contrat du Domain
- ✅ **Isolation technique** : Tout le code Axios est ici, pas ailleurs
- ✅ **Logging structuré** : Utilise Pino pour tracer les appels
- ✅ **Gestion d'erreurs** : Différencie erreurs Axios vs autres erreurs
- ✅ **Configuration** : Timeout et headers configurables

### Dépendances requises
```bash
pnpm add axios
```

---

## 🔨 Étape 4 : Commande Application

### Fichier créé
`src/application/commands/FetchExternalDataCommand.ts`

### Objectif
Représenter l'intention de l'utilisateur : "Je veux récupérer des données externes".

### Code
```typescript
/**
 * Command to fetch data from external API.
 * This command represents the user's intention to retrieve external data.
 */
export class FetchExternalDataCommand {
  // Empty command - no parameters needed for simple GET request
}
```

### Pourquoi cette approche ?
- ✅ **CQRS** : Séparation Commandes (write) / Queries (read)
- ✅ **Intention explicite** : Le nom de la classe est auto-documenté
- ✅ **Extensibilité** : Facile d'ajouter des paramètres si besoin

---

## 🔨 Étape 5 : Handler Application avec Cache-Aside

### Fichier créé
`src/application/commands/FetchExternalDataCommandHandler.ts`

### Objectif
Orchestrer la logique métier : vérifier le cache, appeler l'API si besoin, mettre en cache.

### Code
```typescript
import { FetchExternalDataCommand } from './FetchExternalDataCommand';
import { IExternalDataService } from '../../domain/services/IExternalDataService';
import { ICacheRepository } from '../../infrastructure/persistence/RedisCacheRepository';
import { PinoLogger } from '../../infrastructure/logging/PinoLogger';

/**
 * Handler for the FetchExternalDataCommand.
 * Implements Cache-Aside pattern for external API calls.
 *
 * Responsibilities:
 * - Check Redis cache for existing data
 * - Fetch from external API if cache miss
 * - Store result in cache
 * - Return data to caller
 */
export class FetchExternalDataCommandHandler {
  private readonly logger: PinoLogger;
  private readonly CACHE_KEY = 'external-api:data';
  private readonly CACHE_TTL = 3600; // 1 hour

  /**
   * Creates a new instance of the handler.
   *
   * @param externalDataService - Service to fetch data from external API
   * @param cacheRepository - Redis cache repository
   */
  constructor(
    private readonly externalDataService: IExternalDataService,
    private readonly cacheRepository: ICacheRepository,
  ) {
    this.logger = new PinoLogger({ context: 'FetchExternalDataCommandHandler' });
  }

  /**
   * Executes the fetch external data command using Cache-Aside pattern.
   *
   * @param _command - The command to execute (unused - no parameters needed)
   * @returns Promise resolving to the external API data
   * @throws Error if both cache and external API fail
   */
  public async handle(_command: FetchExternalDataCommand): Promise<unknown> {
    try {
      // 1. Try to get data from cache (Cache-Aside pattern)
      const cachedData = await this.cacheRepository.get<unknown>(this.CACHE_KEY);

      if (cachedData !== null) {
        this.logger.debug('Cache hit for external API data');
        return cachedData;
      }

      this.logger.debug('Cache miss for external API data, fetching from external API');

      // 2. Cache miss - fetch from external API
      const freshData = await this.externalDataService.fetchData();

      // 3. Store in cache for future requests
      await this.cacheRepository.set(this.CACHE_KEY, freshData, this.CACHE_TTL);

      this.logger.info('External API data cached successfully', {
        ttl: this.CACHE_TTL,
      });

      return freshData;
    } catch (error) {
      this.logger.error('Failed to fetch external data', error);

      // If we have an error, still try to return stale cache if available
      const staleData = await this.cacheRepository.get<unknown>(this.CACHE_KEY);
      if (staleData !== null) {
        this.logger.warn('Returning stale cached data due to external API failure');
        return staleData;
      }

      throw new Error('Failed to fetch external data and no cached data available');
    }
  }
}
```

### Pourquoi cette approche ?
- ✅ **Cache-Aside Pattern** : Check cache → API → Store cache
- ✅ **Orchestration** : Coordonne service externe + cache Redis
- ✅ **Résilience** : Fallback sur cache stale en cas d'erreur API
- ✅ **Performance** : Évite les appels répétés à l'API externe
- ✅ **Logging** : Trace les cache hits/misses pour le monitoring

### Pattern Cache-Aside Expliqué
```
┌──────────────┐
│  1. GET data │
└──────┬───────┘
       │
       ▼
┌─────────────────┐
│ Cache hit?      │
├─────────────────┤
│ YES → Return    │ ← Fast path (Redis)
│ NO  → Continue  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 2. Fetch from   │
│    External API │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 3. Store in     │
│    Cache (TTL)  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 4. Return data  │
└─────────────────┘
```

---

## 🔨 Étape 6 : Controller Presentation

### Fichier créé
`src/presentation/controllers/ExtraApiController.ts`

### Objectif
Gérer les requêtes HTTP : extraire les données, créer la commande, retourner la réponse.

### Code
```typescript
import { Request, Response, NextFunction } from 'express';
import { FetchExternalDataCommandHandler } from '../../application/commands/FetchExternalDataCommandHandler';
import { FetchExternalDataCommand } from '../../application/commands/FetchExternalDataCommand';

/**
 * Controller for external API operations.
 * Handles HTTP requests related to fetching data from external services.
 */
export class ExtraApiController {
  /**
   * Creates a new ExtraApiController instance.
   *
   * @param fetchDataHandler - Handler for fetching external data
   */
  constructor(
    private readonly fetchDataHandler: FetchExternalDataCommandHandler,
  ) {}

  /**
   * Handles GET request to fetch data from external API.
   * Endpoint: GET /extra-api
   *
   * @param _req - Express request object (unused)
   * @param res - Express response object
   * @param next - Express next function for error handling
   */
  public getExtraData = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // 1. Create command (no parameters needed)
      const command = new FetchExternalDataCommand();

      // 2. Execute command via handler (with cache)
      const data = await this.fetchDataHandler.handle(command);

      // 3. Return successful HTTP response
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      // Delegate to error middleware
      next(error);
    }
  };
}
```

### Pourquoi cette approche ?
- ✅ **Responsabilité unique** : Gérer HTTP uniquement, pas de logique métier
- ✅ **Format standardisé** : Réponse `{ success: true, data: ... }`
- ✅ **Gestion d'erreurs** : Délègue au middleware d'erreur global
- ✅ **Injection de dépendances** : Handler injecté via constructeur

---

## 🔨 Étape 7 : Routes avec Dependency Injection

### Fichier créé
`src/presentation/routes/extraRoutes.ts`

### Objectif
Câbler toutes les dépendances et enregistrer la route Express.

### Code
```typescript
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
    cacheRepository,
  );

  // 4. Create controller with handler
  const extraApiController = new ExtraApiController(fetchDataHandler);

  // 5. Register routes
  router.get('/', extraApiController.getExtraData);

  return router;
};
```

### Enregistrer la route dans l'application

Dans `src/app.ts` :
```typescript
import { getExtraApiRouter } from './presentation/routes/extraRoutes';

// ... autres imports ...

export const createApp = (): Express => {
  const app = express();

  // ... middlewares ...

  // Register routes
  app.use('/extra-api', getExtraApiRouter()); // ← Ajouter cette ligne

  return app;
};
```

### Pourquoi cette approche ?
- ✅ **Factory Pattern** : Fonction qui crée toutes les dépendances
- ✅ **Dependency Injection manuelle** : Pas besoin de framework IoC
- ✅ **Ordre logique** : Config → Infra → App → Presentation
- ✅ **Inversion of Control** : Les classes reçoivent leurs dépendances
- ✅ **Testabilité** : Facile de créer une route de test avec des mocks

---

## 📊 Flux Complet d'une Requête

Voici le parcours complet d'une requête `GET /extra-api` :

```
1. HTTP Request
   │
   │  GET /extra-api
   │
   ▼
2. Express Router (extraRoutes.ts)
   │
   ▼
3. ExtraApiController.getExtraData()
   │
   │  - Crée FetchExternalDataCommand
   │
   ▼
4. FetchExternalDataCommandHandler.handle()
   │
   ├─→ 4a. Check Redis Cache
   │   │
   │   ├─ Cache HIT  → Return cached data ✅ (fast path)
   │   │
   │   └─ Cache MISS → Continue
   │       │
   │       ▼
   ├─→ 4b. ExternalDataServiceImpl.fetchData()
   │   │
   │   │  - Appel Axios GET vers URL externe
   │   │  - Logging + Gestion d'erreurs
   │   │
   │   ▼
   └─→ 4c. Store in Redis Cache
       │
       │  - TTL: 3600s (1h)
       │  - Key: "external-api:data"
       │
       ▼
5. Return data to Controller
   │
   ▼
6. Controller format response
   │
   │  { success: true, data: ... }
   │
   ▼
7. HTTP Response 200 OK
```

---

## 🧪 Comment Tester

### 1. Configuration
```bash
# .env
EXTRA_API_KEY=https://jsonplaceholder.typicode.com/posts/1
```

### 2. Démarrer l'application
```bash
# Avec Docker (inclut Redis)
docker-compose up -d

# Ou manuellement
pnpm dev
```

### 3. Premier appel (cache miss)
```bash
curl http://localhost:3000/extra-api
```

**Logs attendus :**
```
[info] Fetching data from external API
[info] Data fetched successfully from external API (status: 200)
[info] External API data cached successfully (ttl: 3600)
```

### 4. Deuxième appel (cache hit)
```bash
curl http://localhost:3000/extra-api
```

**Logs attendus :**
```
[debug] Cache hit for external API data
```

### 5. Vérifier le cache Redis
```bash
# Se connecter à Redis
redis-cli

# Vérifier la clé
GET external-api:data

# Voir le TTL restant
TTL external-api:data
```

---

## 🎯 Avantages de Cette Architecture

### ✅ Testabilité
Chaque couche peut être testée indépendamment :
```typescript
// Test du Handler avec mocks
const mockService = { fetchData: jest.fn() };
const mockCache = { get: jest.fn(), set: jest.fn() };
const handler = new FetchExternalDataCommandHandler(mockService, mockCache);
```

### ✅ Maintenabilité
Une modification dans une couche n'impacte pas les autres :
- Changer l'API externe → Modifier uniquement `ExternalDataServiceImpl`
- Changer le cache Redis → Modifier uniquement `RedisCacheRepository`
- Changer le format HTTP → Modifier uniquement `ExtraApiController`

### ✅ Réutilisabilité
Le service externe peut être utilisé ailleurs :
```typescript
// Dans un autre handler
const anotherHandler = new AnotherCommandHandler(externalDataService);
```

### ✅ Performance
Le cache Redis évite les appels répétés :
- **1er appel** : ~200-500ms (API externe)
- **Appels suivants** : ~5-10ms (Redis cache)

### ✅ Résilience
Fallback sur cache stale en cas d'erreur API :
```typescript
// Si l'API externe est down, retourne les données cachées
// même si le TTL est expiré
```

---

## 🔄 Extensions Possibles

### 1. Paramètres dynamiques
```typescript
// Command avec paramètres
export class FetchExternalDataCommand {
  constructor(public readonly userId: string) {}
}

// Handler avec cache par utilisateur
const CACHE_KEY = `external-api:user:${command.userId}`;
```

### 2. Retry Logic
```typescript
// Ajouter dans ExternalDataServiceImpl
import axios, { AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

constructor(config: ExternalApiConfig) {
  this.axiosInstance = axios.create({ timeout: config.timeout });

  axiosRetry(this.axiosInstance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
  });
}
```

### 3. Circuit Breaker
```typescript
import CircuitBreaker from 'opossum';

const breaker = new CircuitBreaker(
  async () => this.externalDataService.fetchData(),
  {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  }
);
```

### 4. Métriques
```typescript
// Dans le Handler
const startTime = Date.now();
const data = await this.externalDataService.fetchData();
const duration = Date.now() - startTime;

this.logger.info('API call duration', { duration });
```

---

## 📚 Ressources

### Patterns utilisés
- **Cache-Aside** : Lazy loading du cache
- **Dependency Injection** : Inversion of Control
- **Factory Pattern** : Création des dépendances
- **Repository Pattern** : Abstraction du cache

### Principes SOLID respectés
- **S**ingle Responsibility : Chaque classe a une seule responsabilité
- **O**pen/Closed : Extensible sans modifier le code existant
- **L**iskov Substitution : Les interfaces peuvent être substituées
- **I**nterface Segregation : Interfaces petites et ciblées
- **D**ependency Inversion : Dépendances vers les abstractions

### Documentation complémentaire
- [Architecture DDD](./ARCHITECTURE.md)
- [Structure du projet](./PROJECT_STRUCTURE.txt)
- [Guide des commandes](./COMMANDS.md)

---

## ✅ Checklist d'Implémentation

Utilisez cette checklist pour implémenter d'autres endpoints externes :

- [ ] **Configuration** : Créer classe config injectable
- [ ] **Interface Domain** : Définir contrat dans `domain/services/`
- [ ] **Service Infrastructure** : Implémenter avec librairie technique
- [ ] **Commande** : Créer classe command dans `application/commands/`
- [ ] **Handler** : Implémenter logique métier + cache
- [ ] **Controller** : Gérer HTTP dans `presentation/controllers/`
- [ ] **Routes** : Configurer DI dans `presentation/routes/`
- [ ] **Tests** : Écrire tests unitaires + intégration
- [ ] **Documentation** : Mettre à jour CLAUDE.md + docs/

---

*Dernière mise à jour : 2025-01-17*
