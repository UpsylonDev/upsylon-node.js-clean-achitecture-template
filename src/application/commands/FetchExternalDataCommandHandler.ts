import { FetchExternalDataCommand } from './FetchExternalDataCommand';
import { IExternalDataService } from '../../domain/services/IExternalDataService';
import { ICacheRepository } from '../../domain/repositories/ICacheRepository';

/**
 * Command Handler for fetching external data.
 * Implements caching logic to reduce external API calls.
 *
 * Responsibilities:
 * - Check cache for existing data
 * - Fetch from external service if cache miss
 * - Store fetched data in cache
 */
export class FetchExternalDataCommandHandler {
  private readonly CACHE_KEY = 'external_data';

  /**
   * Creates a new FetchExternalDataCommandHandler instance.
   *
   * @param externalDataService - Service for fetching external data
   * @param cacheRepository - Repository for caching data
   */
  constructor(
    private readonly externalDataService: IExternalDataService,
    private readonly cacheRepository: ICacheRepository
  ) {}

  /**
   * Handles the FetchExternalDataCommand.
   *
   * @param _command - The command (no parameters needed)
   * @returns The fetched data (from cache or external service)
   */
  async handle(_command: FetchExternalDataCommand): Promise<unknown> {
    // 1. Try to get data from cache
    const cachedData = await this.cacheRepository.get(this.CACHE_KEY);
    if (cachedData) {
      return cachedData;
    }

    // 2. Cache miss: fetch from external service
    const data = await this.externalDataService.fetchData();

    // 3. Store in cache for future requests
    await this.cacheRepository.set(this.CACHE_KEY, data);

    return data;
  }
}
