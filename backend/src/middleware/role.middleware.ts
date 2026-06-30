import { Response, NextFunction } from 'express';
import { UserRole, AuthenticatedRequest } from '../types';
import { sendError } from '../utils/response';

/**
 * Role-based access control middleware factory.
 * Usage: authorize(UserRole.ADMIN) or authorize(UserRole.ADMIN, UserRole.USER)
 */
export const authorize = (...roles: UserRole[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}`,
        403
      );
      return;
    }

    next();
  };

/** Shorthand: only ADMIN may proceed */
export const adminOnly = authorize(UserRole.ADMIN);
