import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config';
import { User } from '../models/User';
import { AuthenticationError, AuthorizationError } from './errorHandler';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    req.token = token;

    const decoded = jwt.verify(token, appConfig.jwt.secret) as any;
    
    const user = await User.findById(decoded.id).select('+permissions');
    
    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new AuthenticationError('Account temporarily locked');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
      return;
    }
    next(error);
  }
};

export const authorize = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError());
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(p => userPermissions.includes(p));
    
    if (!hasPermission && req.user.role !== 'SUPER_ADMIN') {
      next(new AuthorizationError());
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, appConfig.jwt.secret) as any;
    
    const user = await User.findById(decoded.id).select('+permissions');
    
    if (user && user.isActive) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
};

export const refreshToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token required');
    }

    const decoded = jwt.verify(refreshToken, appConfig.jwt.refreshSecret) as any;
    
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(new AuthenticationError('Invalid refresh token'));
  }
};

export const generateAccessToken = (user: any): string => {
  return jwt.sign(
    { id: user._id, role: user.role },
    appConfig.jwt.secret,
    { expiresIn: appConfig.jwt.expiresIn }
  );
};

export const generateRefreshToken = (user: any): string => {
  return jwt.sign(
    { id: user._id },
    appConfig.jwt.refreshSecret,
    { expiresIn: appConfig.jwt.refreshExpiresIn }
  );
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  const isProduction = appConfig.env === 'production';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};