import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Joi schema for creating a new user
 * Validates HTTP-level concerns before reaching the domain layer
 */
export const createUserSchema = Joi.object({
  email: Joi.string()
    .required()
    .custom((value) => {
      // Transform: trim and lowercase the email
      return value.trim().toLowerCase();
    })
    .email()
    .max(255)
    .messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'string.max': 'Email must not exceed 255 characters',
      'any.required': 'Email is required',
    }),
  password: Joi.string().required().min(8).messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
}).strict(); // Reject any additional fields not defined in the schema

/**
 * Middleware factory to validate request body against a Joi schema
 * @param schema - The Joi schema to validate against
 * @returns Express middleware function
 */
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Collect all errors, not just the first one
      stripUnknown: false, // Don't strip unknown keys (strict mode will reject them)
      convert: true, // Enable type conversion and transformations (trim, lowercase, etc.)
    });

    if (error) {
      // Format validation errors with field-level details
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          details,
        },
      });
      return;
    }

    // Replace req.body with validated and transformed data
    req.body = value;
    next();
  };
};

/**
 * Middleware to validate user creation requests
 */
export const validateCreateUser = validateRequest(createUserSchema);
