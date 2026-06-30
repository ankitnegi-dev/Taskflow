import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async route handlers to automatically forward errors to Express error middleware.
 * Eliminates repetitive try/catch blocks in controllers.
 */
export const asyncWrapper = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
