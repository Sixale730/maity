/**
 * Error Types for API Endpoints
 *
 * Standardized error handling across all API endpoints
 */

import { VercelResponse } from '@vercel/node';
import { ErrorResponse } from './common.js';

/**
 * Standard API error codes
 */
export enum ApiErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  MISSING_AUTH = 'MISSING_AUTH',

  // Validation errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_USED = 'ALREADY_USED',
  EXPIRED = 'EXPIRED',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',

  // Method errors
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',

  // Rate limiting errors
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * API Error class with structured error information
 */
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * Send error response to client
   */
  send(res: VercelResponse): void {
    const response: ErrorResponse = {
      error: this.code,
      message: this.message,
    };

    if (this.details) {
      response.details = this.details;
    }

    res.status(this.statusCode).json(response);
  }

  /**
   * Factory methods for common errors
   */
  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(ApiErrorCode.UNAUTHORIZED, 401, message);
  }

  static invalidRequest(message = 'Invalid request', details?: unknown): ApiError {
    return new ApiError(ApiErrorCode.INVALID_REQUEST, 400, message, details);
  }

  static notFound(resource = 'Resource'): ApiError {
    return new ApiError(ApiErrorCode.NOT_FOUND, 404, `${resource} not found`);
  }

  static methodNotAllowed(allowed: string[]): ApiError {
    return new ApiError(
      ApiErrorCode.METHOD_NOT_ALLOWED,
      405,
      `Method not allowed. Allowed methods: ${allowed.join(', ')}`
    );
  }

  static internal(message = 'Internal server error', details?: unknown): ApiError {
    return new ApiError(ApiErrorCode.INTERNAL_ERROR, 500, message, details);
  }

  static database(message = 'Database error', details?: unknown): ApiError {
    return new ApiError(ApiErrorCode.DATABASE_ERROR, 500, message, details);
  }

  static invalidSignature(): ApiError {
    return new ApiError(ApiErrorCode.INVALID_SIGNATURE, 401, 'Invalid signature');
  }

  static expired(resource = 'Token'): ApiError {
    return new ApiError(ApiErrorCode.EXPIRED, 410, `${resource} has expired`);
  }

  static alreadyUsed(resource = 'Token'): ApiError {
    return new ApiError(ApiErrorCode.ALREADY_USED, 410, `${resource} has already been used`);
  }

  static tooManyRequests(message = 'Too many requests'): ApiError {
    return new ApiError(ApiErrorCode.RATE_LIMIT_EXCEEDED, 429, message);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(ApiErrorCode.UNAUTHORIZED, 403, message);
  }

  static badRequest(message = 'Bad request', details?: unknown): ApiError {
    return new ApiError(ApiErrorCode.INVALID_REQUEST, 400, message, details);
  }
}

/**
 * Error handler wrapper for API endpoints
 */
export function withErrorHandler(handler: (req: any, res: VercelResponse) => Promise<void>) {
  return async (req: any, res: VercelResponse): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof ApiError) {
        error.send(res);
      } else if (error instanceof Error) {
        ApiError.internal(error.message).send(res);
      } else {
        ApiError.internal('Unknown error occurred').send(res);
      }
    }
  };
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  body: T,
  fields: (keyof T)[]
): void {
  const missing = fields.filter(field => !body[field]);
  if (missing.length > 0) {
    throw ApiError.invalidRequest(
      `Missing required fields: ${missing.join(', ')}`,
      { missingFields: missing }
    );
  }
}

/**
 * Validate request method
 */
export function validateMethod(actual: string | undefined, allowed: string[]): void {
  if (!actual || !allowed.includes(actual)) {
    throw ApiError.methodNotAllowed(allowed);
  }
}
