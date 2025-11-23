import { CreateUserCommand } from './CreateUserCommand';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/valueObjects/Email';
import { Password } from '../../domain/valueObjects/Password';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

/**
 * Command Handler for creating a new user.
 * Implements the application logic for user creation.
 *
 * Responsibilities:
 * - Validate business rules (e.g., email uniqueness)
 * - Create domain entities
 * - Delegate persistence to the repository
 */
export class CreateUserCommandHandler {
  /**
   * Creates a new CreateUserCommandHandler instance.
   *
   * @param userRepository - Repository for user persistence
   */
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Handles the CreateUserCommand.
   *
   * @param command - The command containing user creation data
   * @returns The created user entity
   * @throws Error if email already exists or validation fails
   */
  async handle(command: CreateUserCommand): Promise<User> {
    // 1. Create value objects (validation happens in constructors)
    const email = new Email(command.email);
    const password = await Password.create(command.password);

    // 2. Check business rule: email must be unique
    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // 3. Create domain entity with generated ID
    const userId = this.generateId();
    const user = new User(userId, email, password);

    // 4. Persist the user
    const savedUser = await this.userRepository.save(user);

    return savedUser;
  }

  /**
   * Generates a unique ID for the user.
   * In a real application, this could use UUID or database auto-increment.
   *
   * @private
   * @returns A unique identifier string
   */
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
