import { CreateUserCommand } from './CreateUserCommand';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/valueObjects/Email';
import { Password } from '../../domain/valueObjects/Password';

/**
 * Handler for the CreateUserCommand.
 * Orchestrates the application logic for creating a user.
 *
 * Responsibilities:
 * - Receive the command
 * - Verify email uniqueness
 * - Create domain Value Objects
 * - Create the User entity
 * - Request the repository to persist
 *
 * @class CreateUserCommandHandler
 */
export class CreateUserCommandHandler {
  /**
   * Creates a new instance of the handler.
   *
   * @param {IUserRepository} userRepository - The user repository (injected)
   */
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Executes the user creation command.
   *
   * @param {CreateUserCommand} command - The command to execute
   * @returns {Promise<User>} The created user
   * @throws {Error} If the email already exists or validation fails
   */
  public async handle(command: CreateUserCommand): Promise<User> {
    // 1. Create the Email Value Object (with validation)
    const email = new Email(command.email);

    // 2. Check email uniqueness
    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // 3. Create the Password Value Object (with validation and hashing)
    const password = await Password.create(command.password);

    // 4. Create the User entity with a temporary ID
    // MongoDB will generate the real ObjectId during save
    const user = new User('temp-id', email, password);

    // 5. Persist via the repository (will return user with MongoDB-generated ID)
    const savedUser = await this.userRepository.save(user);

    return savedUser;
  }
}
