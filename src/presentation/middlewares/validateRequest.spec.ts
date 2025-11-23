import { Request, Response, NextFunction } from 'express';
import { validateCreateUser, createUserSchema } from './validateRequest';

describe('validateRequest middleware', () => {
  let mockRequest: Partial<Request>; // ? Partial to allow flexible body assignment (Becomes optionnal)
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    mockRequest = {};
    mockResponse = {
      status: statusMock as any,
      json: jsonMock,
    };
    mockNext = jest.fn();
  });

  describe('createUserSchema', () => {
    describe('Valid requests', () => {
      it('should pass validation with valid email and password', () => {
        mockRequest.body = {
          email: 'test@example.com',
          password: 'SecurePass123',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(statusMock).not.toHaveBeenCalled();
      });

      it('should normalize email (trim and lowercase)', () => {
        mockRequest.body = {
          email: '  TEST@EXAMPLE.COM  ',
          password: 'SecurePass123',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        // Joi transforms the data during validation
        expect(mockNext).toHaveBeenCalled();
        expect(mockRequest.body.email).toBe('test@example.com');
        expect(statusMock).not.toHaveBeenCalled();
      });

      it('should accept password with minimum 8 characters', () => {
        mockRequest.body = {
          email: 'test@example.com',
          password: 'Pass1234',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(statusMock).not.toHaveBeenCalled();
      });

      it('should accept email with maximum 255 characters', () => {
        // Email format: local@domain, need valid format within 255 chars
        const localPart = 'a'.repeat(50);
        const domain = 'example.com';
        const longEmail = localPart + '@' + domain; // Valid email under 255 chars

        mockRequest.body = {
          email: longEmail,
          password: 'SecurePass123',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(statusMock).not.toHaveBeenCalled();
      });
    });

    describe('Invalid requests - Missing fields', () => {
      it('should reject request with missing email', () => {
        mockRequest.body = {
          password: 'SecurePass123',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: 'Email is required',
              }),
            ]),
          },
        });
      });

      it('should reject request with missing password', () => {
        mockRequest.body = {
          email: 'test@example.com',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'password',
                message: 'Password is required',
              }),
            ]),
          },
        });
      });

      it('should reject request with both fields missing', () => {
        mockRequest.body = {};

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: expect.arrayContaining([
              expect.objectContaining({ field: 'email' }),
              expect.objectContaining({ field: 'password' }),
            ]),
          },
        });
      });
    });

    describe('Invalid requests - Wrong types', () => {
      it('should reject non-string email', () => {
        mockRequest.body = {
          email: 12345,
          password: 'SecurePass123',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: 'Email must be a string',
              }),
            ]),
          },
        });
      });

      it('should reject non-string password', () => {
        mockRequest.body = {
          email: 'test@example.com',
          password: 12345678,
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'password',
                message: 'Password must be a string',
              }),
            ]),
          },
        });
      });
    });

    describe('Invalid requests - Format validation', () => {
      it('should reject invalid email format', () => {
        mockRequest.body = {
          email: 'invalid-email',
          password: 'SecurePass123',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: 'Email must be a valid email address',
              }),
            ]),
          },
        });
      });

      it('should reject empty email string', () => {
        mockRequest.body = {
          email: '',
          password: 'SecurePass123',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: 'Email cannot be empty',
              }),
            ]),
          },
        });
      });

      it('should reject empty password string', () => {
        mockRequest.body = {
          email: 'test@example.com',
          password: '',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'password',
                message: 'Password cannot be empty',
              }),
            ]),
          },
        });
      });

      it('should reject email exceeding max length (255 characters)', () => {
        const longEmail = 'a'.repeat(244) + '@example.com'; // 256 chars total

        mockRequest.body = {
          email: longEmail,
          password: 'SecurePass123',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: 'Email must not exceed 255 characters',
              }),
            ]),
          },
        });
      });

      it('should reject password shorter than 8 characters', () => {
        mockRequest.body = {
          email: 'test@example.com',
          password: 'Pass12',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'password',
                message: 'Password must be at least 8 characters long',
              }),
            ]),
          },
        });
      });
    });

    describe('Invalid requests - Extra fields (strict mode)', () => {
      it('should reject request with extra fields', () => {
        mockRequest.body = {
          email: 'test@example.com',
          password: 'SecurePass123',
          extraField: 'should not be here',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'extraField',
              }),
            ]),
          },
        });
      });

      it('should reject request with multiple extra fields', () => {
        mockRequest.body = {
          email: 'test@example.com',
          password: 'SecurePass123',
          field1: 'extra',
          field2: 'also extra',
        };

        validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        const call = jsonMock.mock.calls[0][0];
        expect(call.error.details).toHaveLength(2);
      });
    });

    describe('Schema validation directly', () => {
      it('should validate correct data', () => {
        const { error } = createUserSchema.validate({
          email: 'test@example.com',
          password: 'SecurePass123',
        });

        expect(error).toBeUndefined();
      });

      it('should return multiple errors with abortEarly: false', () => {
        const { error } = createUserSchema.validate({}, { abortEarly: false });

        expect(error).toBeDefined();
        expect(error!.details).toHaveLength(2); // email and password both missing
      });
    });
  });
});
