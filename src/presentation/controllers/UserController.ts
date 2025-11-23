import { Request, Response, NextFunction } from 'express';
import { CreateUserCommandHandler } from '../../application/commands/CreateUserCommandHandler';
import { CreateUserCommand } from '../../application/commands/CreateUserCommand';
import { CreateUserDTO } from '../../application/dtos/CreateUserDTO';

/**
 * Controller for user-related operations.
 * Responsible for HTTP request handling and delegation to the application layer.
 *
 * Responsibilities:
 * - Extract data from the request (validation is done by middleware)
 * - Delegate to the application layer (Command Handler)
 * - Format HTTP response
 *
 * @class UserController
 */
export class UserController {
  /**
   * Creates a new instance of the controller.
   *
   * @param {CreateUserCommandHandler} createUserHandler - The user creation handler (injected)
   */
  constructor(private readonly createUserHandler: CreateUserCommandHandler) {}

  /**
   * Creates a new user.
   * Route: POST /user
   *
   * Request validation is handled by the validateCreateUser middleware.
   *
   * @param {Request} req - The Express request
   * @param {Response} res - The Express response
   * @param {NextFunction} next - The Express next function
   */
  public createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // 1. Extract data (already validated by Joi middleware)
      const dto: CreateUserDTO = {
        email: req.body.email,
        password: req.body.password,
      };

      // 2. Create the command
      const command = new CreateUserCommand(dto.email, dto.password);

      // 3. Delegate to the application layer
      const user = await this.createUserHandler.handle(command);

      // 4. Return HTTP response
      res.status(201).json({
        success: true,
        data: user.toPublicObject(),
      });
    } catch (error) {
      // Delegate to error middleware
      next(error);
    }
  };
}
