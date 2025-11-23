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
          `External API request failed: ${error.response?.status || error.message}`
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
