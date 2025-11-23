import { MongoUserRepository } from './MongoUserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/valueObjects/Email';
import { Password } from '../../domain/valueObjects/Password';
import { UserModel } from './mongoose/userModel';

// Mock Mongoose
jest.mock('./mongoose/userModel');

describe('MongoUserRepository', () => {
  let repository: MongoUserRepository;
  let mockEmail: Email;
  let mockPassword: Password;
  let mockUser: User;

  beforeEach(async () => {
    repository = new MongoUserRepository();
    mockEmail = new Email('test@example.com');
    mockPassword = await Password.create('ValidPass123');
    mockUser = new User('user-id-123', mockEmail, mockPassword);

    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a user successfully', async () => {
      const savedDocument = {
        _id: 'generated-id-456',
        email: mockUser.getEmail().getValue(),
        password: mockUser.getPassword().getHash(),
        createdAt: mockUser.getCreatedAt(),
      };

      const mockSave = jest.fn().mockResolvedValue(savedDocument);

      (UserModel as any).mockImplementation(() => ({
        ...savedDocument,
        save: mockSave,
      }));

      const result = await repository.save(mockUser);

      expect(result).toBeInstanceOf(User);
      expect(result.getEmail().getValue()).toBe(mockUser.getEmail().getValue());
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('should throw error on duplicate email', async () => {
      const mockSave = jest.fn().mockRejectedValue({ code: 11000 });

      (UserModel as any).mockImplementation(() => ({
        save: mockSave,
      }));

      await expect(repository.save(mockUser)).rejects.toThrow('Email already exists');
    });

    it('should throw error on database failure', async () => {
      const mockSave = jest.fn().mockRejectedValue(new Error('Database error'));

      (UserModel as any).mockImplementation(() => ({
        save: mockSave,
      }));

      await expect(repository.save(mockUser)).rejects.toThrow('Failed to save user');
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const mockDocument = {
        _id: 'user-id-123',
        email: 'test@example.com',
        password: '$2b$10$hash',
        createdAt: new Date(),
      };

      const mockExec = jest.fn().mockResolvedValue(mockDocument);
      (UserModel.findOne as jest.Mock) = jest.fn().mockReturnValue({
        exec: mockExec,
      });

      const result = await repository.findByEmail(mockEmail);

      expect(result).toBeInstanceOf(User);
      expect(result?.getEmail().getValue()).toBe('test@example.com');
      expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return null if user not found', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      (UserModel.findOne as jest.Mock) = jest.fn().mockReturnValue({
        exec: mockExec,
      });

      const result = await repository.findByEmail(mockEmail);

      expect(result).toBeNull();
    });
  });

  describe('existsByEmail', () => {
    it('should return true if email exists', async () => {
      const mockExec = jest.fn().mockResolvedValue(1);
      (UserModel.countDocuments as jest.Mock) = jest.fn().mockReturnValue({
        exec: mockExec,
      });

      const result = await repository.existsByEmail(mockEmail);

      expect(result).toBe(true);
      expect(UserModel.countDocuments).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should return false if email does not exist', async () => {
      const mockExec = jest.fn().mockResolvedValue(0);
      (UserModel.countDocuments as jest.Mock) = jest.fn().mockReturnValue({
        exec: mockExec,
      });

      const result = await repository.existsByEmail(mockEmail);

      expect(result).toBe(false);
    });
  });
});
