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
