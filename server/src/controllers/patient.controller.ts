import { Request, Response, NextFunction } from 'express';
import { patientService } from '../services/patient.service.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';
import { getRequestIp, logAuditEvent } from '../utils/audit.js';

export class PatientController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, status, barangayId } = req.query;
      const result = await patientService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        status: status as string,
        barangayId: barangayId as string,
      });
      sendPaginated(res, result.patients, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const patient = await patientService.findById(req.params.id);
      sendSuccess(res, patient);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patient = await patientService.create(req.body);
      const authReq = req as AuthenticatedRequest;
      await logAuditEvent({
        action: 'CREATE',
        entityType: 'PATIENT',
        entityId: patient.id,
        userId: authReq.user?.userId,
        newData: {
          status: 'Success',
          resource: `Patient Record: ${patient.firstName} ${patient.lastName}`,
        },
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'],
      });
      sendCreated(res, patient, 'Patient created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const before = await patientService.findById(req.params.id);
      const patient = await patientService.update(req.params.id, req.body);
      const authReq = req as AuthenticatedRequest;
      await logAuditEvent({
        action: 'UPDATE',
        entityType: 'PATIENT',
        entityId: patient.id,
        userId: authReq.user?.userId,
        oldData: {
          firstName: before.firstName,
          lastName: before.lastName,
          status: before.status,
        },
        newData: {
          status: 'Success',
          resource: `Patient Record: ${patient.firstName} ${patient.lastName}`,
          firstName: patient.firstName,
          lastName: patient.lastName,
          statusValue: patient.status,
        },
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'],
      });
      sendSuccess(res, patient, 'Patient updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const before = await patientService.findById(req.params.id);
      await patientService.delete(req.params.id);
      const authReq = req as AuthenticatedRequest;
      await logAuditEvent({
        action: 'DELETE',
        entityType: 'PATIENT',
        entityId: req.params.id,
        userId: authReq.user?.userId,
        oldData: {
          firstName: before.firstName,
          lastName: before.lastName,
          status: before.status,
        },
        newData: {
          status: 'Success',
          resource: `Patient Record: ${before.firstName} ${before.lastName}`,
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

export const patientController = new PatientController();
