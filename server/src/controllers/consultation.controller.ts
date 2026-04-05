import { Request, Response, NextFunction } from 'express';
import { consultationService } from '../services/consultation.service.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';

export class ConsultationController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, patientId, staffId, status, type, startDate, endDate } = req.query;
      const result = await consultationService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        patientId: patientId as string,
        staffId: staffId as string,
        status: status as string,
        type: type as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      sendPaginated(res, result.consultations, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultation = await consultationService.findById(req.params.id);
      sendSuccess(res, consultation);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultation = await consultationService.create(req.body);
      sendCreated(res, consultation, 'Consultation created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultation = await consultationService.update(req.params.id, req.body);
      sendSuccess(res, consultation, 'Consultation updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await consultationService.delete(req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const consultationController = new ConsultationController();
