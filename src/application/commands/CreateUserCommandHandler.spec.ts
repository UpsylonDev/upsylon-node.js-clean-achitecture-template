import { CreateUserCommandHandler } from './CreateUserCommandHandler';
import { CreateUserCommand } from './CreateUserCommand';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

describe('CreateUserCommandHandler', () => {
  let handler: CreateUserCommandHandler;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    // Mock the repository
    mockUserRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      existsByEmail: jest.fn(),
    };

    handler = new CreateUserCommandHandler(mockUserRepository);
  });

  describe('handle', () => {
    it('should create a user successfully', async () => {
      const command = new CreateUserCommand('test@example.com', 'ValidPass123');

      // Mock: email does not exist
      mockUserRepository.existsByEmail.mockResolvedValue(false);

      // Mock: save returns the user
      mockUserRepository.save.mockImplementation(async (user: User) => user);

      const result = await handler.handle(command);

      expect(result).toBeInstanceOf(User);
      expect(result.getEmail().getValue()).toBe('test@example.com');
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw error if email already exists', async () => {
      const command = new CreateUserCommand('existing@example.com', 'ValidPass123');

      // Mock: email already exists
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(handler.handle(command)).rejects.toThrow('Email already exists');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      const command = new CreateUserCommand('invalid-email', 'ValidPass123');

      await expect(handler.handle(command)).rejects.toThrow('Invalid email format');
      expect(mockUserRepository.existsByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for weak password', async () => {
      const command = new CreateUserCommand('test@example.com', 'weak');

      mockUserRepository.existsByEmail.mockResolvedValue(false);

      await expect(handler.handle(command)).rejects.toThrow(
        'Password must be at least 8 characters long'
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should generate unique user ID', async () => {
      const command = new CreateUserCommand('test@example.com', 'ValidPass123');

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation(async (user: User) => user);

      const result = await handler.handle(command);

      expect(result.getId()).toBeDefined();
      expect(result.getId().length).toBeGreaterThan(0);
    });
  });
});
