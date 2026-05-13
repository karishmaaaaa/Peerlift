import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, createErrorResponse } from '@/utils/errors';
import { logger } from '@/utils/logger';

export interface ErrorRequest extends Request {
  requestId?: string;
}

export const errorHandler = (
  error: unknown,
  req: ErrorRequest,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.requestId || 'unknown';

  // Log the error
  if (error instanceof AppError) {
    logger.warn('Application error', {
      requestId,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
    });
  } else if (error instanceof ZodError) {
    logger.warn('Validation error', {
      requestId,
      path: req.path,
      method: req.method,
      errors: error.errors,
    });
  } else if (error instanceof Error) {
    logger.error('Unexpected error', {
      requestId,
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error('Unknown error', {
      requestId,
      error,
      path: req.path,
      method: req.method,
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle AppError instances
  if (error instanceof AppError) {
    res.status(error.statusCode).json(createErrorResponse(error));
    return;
  }

  // Handle Express errors
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'SYNTAX_ERROR',
        message: 'Invalid request body',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle all other errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    timestamp: new Date().toISOString(),
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
