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
  constructor(private readonly fetchDataHandler: FetchExternalDataCommandHandler) {}

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
    next: NextFunction
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
