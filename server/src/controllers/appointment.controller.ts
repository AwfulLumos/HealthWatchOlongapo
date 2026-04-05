import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointment.service.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';

export class AppointmentController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, patientId, staffId, status, startDate, endDate } = req.query;
      const result = await appointmentService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        patientId: patientId as string,
        staffId: staffId as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      sendPaginated(res, result.appointments, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointment = await appointmentService.update(req.params.id, req.body);
      sendSuccess(res, appointment, 'Appointment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await appointmentService.delete(req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentController = new AppointmentController();
