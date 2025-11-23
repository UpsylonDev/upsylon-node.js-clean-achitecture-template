import { User } from './User';
import { Email } from '../valueObjects/Email';
import { Password } from '../valueObjects/Password';

describe('User Entity', () => {
  let email: Email;
  let password: Password;

  beforeEach(async () => {
    email = new Email('test@example.com');
    password = await Password.create('ValidPass123');
  });

  describe('Constructor', () => {
    it('should create a valid user', () => {
      const user = new User('user-id-123', email, password);

      expect(user.getId()).toBe('user-id-123');
      expect(user.getEmail()).toBe(email);
      expect(user.getPassword()).toBe(password);
      expect(user.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should create a user with custom createdAt', () => {
      const customDate = new Date('2024-01-01');
      const user = new User('user-id-123', email, password, customDate);

      expect(user.getCreatedAt()).toEqual(customDate);
    });

    it('should throw error for empty user id', () => {
      expect(() => new User('', email, password)).toThrow('User ID cannot be empty');
    });

    it('should throw error for whitespace only user id', () => {
      expect(() => new User('   ', email, password)).toThrow('User ID cannot be empty');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const user = new User('user-id-123', email, password);
      const isValid = await user.verifyPassword('ValidPass123');
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = new User('user-id-123', email, password);
      const isValid = await user.verifyPassword('WrongPass456');
      expect(isValid).toBe(false);
    });
  });

  describe('toPublicObject', () => {
    it('should return public representation without password', () => {
      const user = new User('user-id-123', email, password);
      const publicObject = user.toPublicObject();

      expect(publicObject).toEqual({
        id: 'user-id-123',
        email: 'test@example.com',
        createdAt: expect.any(Date),
      });
      expect(publicObject).not.toHaveProperty('password');
    });
  });
});
