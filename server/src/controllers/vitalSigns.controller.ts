import { Request, Response, NextFunction } from 'express';
import { vitalSignsService } from '../services/vitalSigns.service.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';

export class VitalSignsController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, patientId, consultId, startDate, endDate } = req.query;
      const result = await vitalSignsService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        patientId: patientId as string,
        consultId: consultId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      sendPaginated(res, result.vitalSigns, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vitalSigns = await vitalSignsService.findById(req.params.id);
      sendSuccess(res, vitalSigns);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vitalSigns = await vitalSignsService.create(req.body);
      sendCreated(res, vitalSigns, 'Vital signs recorded successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vitalSigns = await vitalSignsService.update(req.params.id, req.body);
      sendSuccess(res, vitalSigns, 'Vital signs updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await vitalSignsService.delete(req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  async getLatestByPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vitalSigns = await vitalSignsService.getLatestByPatient(req.params.patientId);
      sendSuccess(res, vitalSigns);
    } catch (error) {
      next(error);
    }
  }
}

export const vitalSignsController = new VitalSignsController();
