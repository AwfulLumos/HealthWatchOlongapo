import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointment.service.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppointmentListQueryInput } from '../validators/appointment.validator.js';

export class AppointmentController {
  async getCreationOptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const options = await appointmentService.getCreationOptions(authReq.user?.userId);
      sendSuccess(res, options);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, patientId, staffId, status, startDate, endDate } =
        req.query as AppointmentListQueryInput;
      const result = await appointmentService.findAll({
        page,
        limit,
        patientId,
        staffId,
        status,
        startDate,
        endDate,
      });
      sendPaginated(res, result.appointments, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointment = await appointmentService.findById(req.params.id);
      sendSuccess(res, appointment);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointment = await appointmentService.create(req.body);
      sendCreated(res, appointment, 'Appointment created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointment = await appointmentService.update(req.params.id, req.body);
      sendSuccess(res, appointment, 'Appointment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await appointmentService.delete(req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentController = new AppointmentController();
