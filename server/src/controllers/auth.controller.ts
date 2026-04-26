import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';
import { getRequestIp, logAuditEvent } from '../utils/audit.js';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      await logAuditEvent({
        action: 'VIEW',
        entityType: 'AUTH_LOGIN',
        entityId: result.user.id,
        userId: result.user.id,
        newData: {
          status: 'Success',
          resource: 'User Login',
        },
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'],
      });
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      await logAuditEvent({
        action: 'VIEW',
        entityType: 'AUTH_LOGIN',
        entityId: req.body?.username || 'unknown',
        newData: {
          status: 'Blocked',
          resource: 'User Login',
          username: req.body?.username,
        },
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'],
      });
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.register(req.body);
      const authReq = req as AuthenticatedRequest;
      await logAuditEvent({
        action: 'CREATE',
        entityType: 'USER',
        entityId: user.id,
        userId: authReq.user?.userId,
        newData: {
          status: 'Success',
          resource: `User Account: ${user.username}`,
          role: user.role,
        },
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'],
      });
      sendCreated(res, user, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokens = await authService.refreshTokens(req.body.refreshToken);
      sendSuccess(res, tokens, 'Tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logout(req.body.refreshToken);
      const authReq = req as AuthenticatedRequest;
      await logAuditEvent({
        action: 'VIEW',
        entityType: 'AUTH_LOGOUT',
        entityId: authReq.user?.userId || 'unknown',
        userId: authReq.user?.userId,
        newData: {
          status: 'Success',
          resource: 'User Logout',
        },
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'],
      });
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await authService.getProfile(authReq.user.userId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      await authService.changePassword(
        authReq.user.userId,
        req.body.currentPassword,
        req.body.newPassword
      );
      await logAuditEvent({
        action: 'UPDATE',
        entityType: 'USER_PASSWORD',
        entityId: authReq.user.userId,
        userId: authReq.user.userId,
        newData: {
          status: 'Success',
          resource: 'User Password',
        },
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'],
      });
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
