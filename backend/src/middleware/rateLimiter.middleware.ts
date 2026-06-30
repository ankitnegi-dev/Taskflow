import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { sendError } from '../utils/response';
import { Request, Response } from 'express';

/** Global rate limiter applied to all routes */
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    sendError(res, 'Too many requests. Please try again later.', 429);
  },
});

/** Stricter limiter for auth endpoints to prevent brute-force */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    sendError(res, 'Too many login attempts. Please try again in 15 minutes.', 429);
  },
});
