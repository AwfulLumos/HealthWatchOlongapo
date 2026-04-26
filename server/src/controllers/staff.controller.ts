import { Request, Response, NextFunction } from 'express';
import { staffService } from '../services/staff.service.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';
import { getRequestIp, logAuditEvent } from '../utils/audit.js';

export class StaffController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, role, status, stationId } = req.query;
      const result = await staffService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        role: role as string,
        status: status as string,
        stationId: stationId as string,
      });
      sendPaginated(res, result.staff, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const staff = await staffService.findById(req.params.id);
      sendSuccess(res, staff);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staff = await staffService.create(req.body);
      const authReq = req as AuthenticatedRequest;
      await logAuditEvent({
        action: 'CREATE',
        entityType: 'STAFF',
        entityId: staff.id,
        userId: authReq.user?.userId,
        newData: {
          status: 'Success',
          resource: `Staff Account: ${staff.firstName} ${staff.lastName}`,
          role: staff.role,
        },
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'],
      });
      sendCreated(res, staff, 'Staff created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const before = await staffService.findById(req.params.id);
      const staff = await staffService.update(req.params.id, req.body);
      const authReq = req as AuthenticatedRequest;
      await logAuditEvent({
        action: 'UPDATE',
        entityType: 'STAFF',
        entityId: staff.id,
        userId: authReq.user?.userId,
        oldData: {
          firstName: before.firstName,
          lastName: before.lastName,
          role: before.role,
          accountStatus: before.accountStatus,
        },
        newData: {
          status: 'Success',
          resource: `Staff Account: ${staff.firstName} ${staff.lastName}`,
          firstName: staff.firstName,
          lastName: staff.lastName,
          role: staff.role,
          accountStatus: staff.accountStatus,
        },
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'],
      });
      sendSuccess(res, staff, 'Staff updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const before = await staffService.findById(req.params.id);
      await staffService.delete(req.params.id);
      const authReq = req as AuthenticatedRequest;
      await logAuditEvent({
        action: 'DELETE',
        entityType: 'STAFF',
        entityId: req.params.id,
        userId: authReq.user?.userId,
        oldData: {
          firstName: before.firstName,
          lastName: before.lastName,
          role: before.role,
        },
        newData: {
          status: 'Success',
          resource: `Staff Account: ${before.firstName} ${before.lastName}`,
        },
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'],
      });
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const staffController = new StaffController();
