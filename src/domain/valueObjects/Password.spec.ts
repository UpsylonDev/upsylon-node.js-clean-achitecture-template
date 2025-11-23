import { Password } from './Password';

describe('Password Value Object', () => {
  describe('Creation and Validation', () => {
    it('should create a valid password', async () => {
      const password = await Password.create('ValidPass123');
      expect(password).toBeInstanceOf(Password);
      expect(password.getHash()).toBeDefined();
      expect(password.getHash().length).toBeGreaterThan(0);
    });

    it('should hash the password', async () => {
      const plainPassword = 'ValidPass123';
      const password = await Password.create(plainPassword);
      expect(password.getHash()).not.toBe(plainPassword);
    });

    it('should throw error for empty password', async () => {
      await expect(Password.create('')).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for whitespace only password', async () => {
      await expect(Password.create('   ')).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for password too short', async () => {
      await expect(Password.create('Short1')).rejects.toThrow(
        'Password must be at least 8 characters long'
      );
    });

    it('should throw error for password without uppercase', async () => {
      await expect(Password.create('lowercase123')).rejects.toThrow(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should throw error for password without lowercase', async () => {
      await expect(Password.create('UPPERCASE123')).rejects.toThrow(
        'Password must contain at least one lowercase letter'
      );
    });

    it('should throw error for password without number', async () => {
      await expect(Password.create('NoNumberPass')).rejects.toThrow(
        'Password must contain at least one number'
      );
    });
  });

  describe('Compare', () => {
    it('should return true for correct password', async () => {
      const plainPassword = 'ValidPass123';
      const password = await Password.create(plainPassword);
      const isValid = await password.compare(plainPassword);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = await Password.create('ValidPass123');
      const isValid = await password.compare('WrongPass456');
      expect(isValid).toBe(false);
    });
  });

  describe('fromHash', () => {
    it('should create password from existing hash', () => {
      const hash = '$2b$10$abcdefghijklmnopqrstuvwxyz';
      const password = Password.fromHash(hash);
      expect(password.getHash()).toBe(hash);
    });
  });
});
