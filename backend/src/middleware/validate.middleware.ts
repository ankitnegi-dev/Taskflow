import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';
import { ValidationError } from '../types';

type ValidateTarget = 'body' | 'query' | 'params';

/**
 * Zod schema validation middleware factory.
 * Validates req.body, req.query, or req.params against the provided schema.
 */
export const validate =
  (schema: ZodSchema, target: ValidateTarget = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors: ValidationError[] = (result.error as ZodError).errors.map(
        (e) => ({
          field: e.path.join('.'),
          message: e.message,
        })
      );
      sendError(res, 'Validation failed', 422, errors);
      return;
    }

    // Replace with parsed (coerced/transformed) data
    req[target] = result.data;
    next();
  };
