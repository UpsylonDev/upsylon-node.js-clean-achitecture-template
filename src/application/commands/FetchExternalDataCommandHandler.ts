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
    private readonly cacheRepository: ICacheRepository
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
