import { Request, Response, NextFunction } from 'express';
import { sysAdminService } from '../services/sysadmin.service.js';
import { sendSuccess } from '../utils/response.js';
import { getRequestIp, logAuditEvent } from '../utils/audit.js';
import { AuthenticatedRequest } from '../types/index.js';

export class SysAdminController {
  async getRbacPolicy(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = sysAdminService.getRbacPolicy();
      sendSuccess(res, policy);
    } catch (error) {
      next(error);
    }
  }

  async updateRbacPolicy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = sysAdminService.updateRbacPolicy(req.body);
      const authReq = req as AuthenticatedRequest;
      await logAuditEvent({
        action: 'UPDATE',
        entityType: 'RBAC_POLICY',
        entityId: 'default',
        userId: authReq.user?.userId,
        newData: {
          status: 'Success',
          resource: 'Role Permission Policy',
          roleCount: policy.roleLabels.length,
        },
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'],
      });
      sendSuccess(res, policy, 'RBAC policy updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSecurityConfiguration(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = sysAdminService.getSecurityConfiguration();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async updateSecurityControls(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = sysAdminService.updateSecurityControls(req.body.controls);
      const authReq = req as AuthenticatedRequest;
      await logAuditEvent({
        action: 'UPDATE',
        entityType: 'SECURITY_CONTROLS',
        entityId: 'default',
        userId: authReq.user?.userId,
        newData: {
          status: 'Success',
          resource: 'Security Configuration',
          controlsCount: data.controls.length,
        },
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'],
      });
      sendSuccess(res, data, 'Security controls updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAuditTrail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = await sysAdminService.getAuditTrail({
        search: req.query.search as string | undefined,
        action: req.query.action as 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'ALL' | undefined,
      });
      sendSuccess(res, records);
    } catch (error) {
      next(error);
    }
  }
}

export const sysAdminController = new SysAdminController();
