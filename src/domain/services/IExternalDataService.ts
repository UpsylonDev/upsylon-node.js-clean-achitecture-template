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
