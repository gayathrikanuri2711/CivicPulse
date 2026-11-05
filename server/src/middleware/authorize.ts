// CivicPulse AI - Role Authorization Middleware
// Factory function that returns middleware checking req.authUser.role

import { Request, Response, NextFunction } from 'express';
import { AuthorizationError, AuthenticationError } from '../utils/errors.js';
import type { AuthUser } from './auth.js';

type AllowedRole = 'citizen' | 'admin' | 'contractor';

/**
 * Creates Express middleware that authorizes only requests
 * from users with one of the specified roles.
 *
 * Usage:
 *   router.get('/admin-only', authMiddleware, authorize('admin'), handler);
 *   router.get('/admin-or-contractor', authMiddleware, authorize('admin', 'contractor'), handler);
 */
export const authorize = (...allowedRoles: AllowedRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user: AuthUser | undefined = req.authUser;

    if (!user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(
        new AuthorizationError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${user.role}`
        )
      );
    }

    next();
  };
};

