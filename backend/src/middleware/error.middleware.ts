import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

/**
 * Centralized error handling middleware.
 * Must be registered LAST in Express middleware chain.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(res, 'A record with this value already exists.', 409);
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Record not found.', 404);
      return;
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 'Invalid data provided to database.', 400);
    return;
  }

  // JWT errors are handled in auth middleware; anything reaching here is unexpected
  const statusCode = (err as { statusCode?: number }).statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message;

  sendError(res, message, statusCode);
};

/** 404 handler — must be registered after all routes */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found.`, 404);
};
