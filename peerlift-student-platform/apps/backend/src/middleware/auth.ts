import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '@/utils/jwt';
import { AuthenticationError, AuthorizationError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export interface AuthRequest extends Request {
  user?: JWTPayload & { id: string };
  requestId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    req.user = {
      ...decoded,
      id: decoded.userId,
    };

    logger.debug('Auth middleware passed', {
      userId: decoded.userId,
      email: decoded.email,
    });

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed', {
        userId: req.user.userId,
        requiredRoles: roles,
        userRole: req.user.role,
      });
      return next(new AuthorizationError());
    }

    next();
  };
};

export const requestIdMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const requestId = req.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};
