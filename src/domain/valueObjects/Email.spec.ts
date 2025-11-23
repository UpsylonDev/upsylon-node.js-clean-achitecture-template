import { Email } from './Email';

describe('Email Value Object', () => {
  describe('Constructor and Validation', () => {
    it('should create a valid email', () => {
      const email = new Email('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should convert email to lowercase', () => {
      const email = new Email('TEST@EXAMPLE.COM');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = new Email('  test@example.com  ');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw error for empty email', () => {
      expect(() => new Email('')).toThrow('Email cannot be empty');
    });

    it('should throw error for whitespace only email', () => {
      expect(() => new Email('   ')).toThrow('Email cannot be empty');
    });

    it('should throw error for invalid email format - no @', () => {
      expect(() => new Email('invalidemail.com')).toThrow('Invalid email format');
    });

    it('should throw error for invalid email format - no domain', () => {
      expect(() => new Email('test@')).toThrow('Invalid email format');
    });

    it('should throw error for invalid email format - no username', () => {
      expect(() => new Email('@example.com')).toThrow('Invalid email format');
    });
  });

  describe('Equality', () => {
    it('should return true for equal emails', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for equal emails with different casing', () => {
      const email1 = new Email('TEST@example.com');
      const email2 = new Email('test@EXAMPLE.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = new Email('test1@example.com');
      const email2 = new Email('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return email as string', () => {
      const email = new Email('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });
  });
});
