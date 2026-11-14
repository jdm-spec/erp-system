import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiResponse } from '@erp/shared-types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const requestId = req.headers['x-request-id'] as string | undefined;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request input data',
        details: err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
    return res.status(400).json(response);
  }

  // Handle Custom Application Errors
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
    return res.status(err.statusCode).json(response);
  }

  // Handle Unexpected Server Errors (never leak internal details or stack traces to clients)
  console.error('[UNHANDLED_EXCEPTION]', err);

  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message,
      details: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  return res.status(500).json(response);
}

