import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { prisma } from '../config/database.js';
import { StaffRole, UserRole } from '@prisma/client';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        role: true,
        accountStatus: true,
        staff: { select: { role: true } },
      },
    });

    if (!user || user.accountStatus !== 'Active') {
      throw new UnauthorizedError('User not found or inactive');
    }

    req.user = {
      userId: payload.userId,
      role: user.role,
      staffRole: user.staff?.role,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

export function authorize(...allowedRoles: Array<UserRole | StaffRole>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const isAllowedUserRole = allowedRoles.includes(req.user.role);
    const isAllowedStaffRole = req.user.staffRole ? allowedRoles.includes(req.user.staffRole) : false;

    if (!isAllowedUserRole && !isAllowedStaffRole) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}
