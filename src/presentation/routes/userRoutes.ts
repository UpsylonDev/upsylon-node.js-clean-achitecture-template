import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { CreateUserCommandHandler } from '../../application/commands/CreateUserCommandHandler';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/typeorm/TypeOrmUserRepository';
import { validateCreateUser } from '../middlewares/validateRequest';
import { strictRateLimiter } from '../middlewares/rateLimiter';

/**
 * Configures routes for user operations.
 * Uses the Dependency Injection pattern to create the controller.
 *
 * @returns {Router} The configured Express router
 */
export const createUserRouter = (): Router => {
  const router = Router();

  // Manual dependency injection (can be replaced with an IoC container)
  const userRepository = new TypeOrmUserRepository();
  const createUserHandler = new CreateUserCommandHandler(userRepository);
  const userController = new UserController(createUserHandler);

  /**
   * POST /user
   * Creates a new user.
   *
   * Body:
   * {
   *   "email": "user@example.com",
   *   "password": "SecurePass123"
   * }
   *
   * Success response (201):
   * {
   *   "success": true,
   *   "data": {
   *     "id": "uuid",
   *     "email": "user@example.com",
   *     "createdAt": "2024-01-01T00:00:00.000Z"
   *   }
   * }
   *
   * Error response (400/409/500):
   * {
   *   "success": false,
   *   "error": {
   *     "message": "Error message",
   *     "statusCode": 400,
   *     "timestamp": "2024-01-01T00:00:00.000Z",
   *     "path": "/user",
   *     "details": [{"field": "email", "message": "Email is required"}] // Only for validation errors
   *   }
   * }
   */
  router.post('/', strictRateLimiter, validateCreateUser, userController.createUser);

  return router;
};
