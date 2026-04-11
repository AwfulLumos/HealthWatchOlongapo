import { Request, Response, NextFunction } from 'express';
import { prescriptionService } from '../services/prescription.service.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';

export class PrescriptionController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, patientId, consultId, doctorId } = req.query;
      const result = await prescriptionService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        patientId: patientId as string,
        consultId: consultId as string,
        doctorId: doctorId as string,
      });
      sendPaginated(res, result.prescriptions, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const prescription = await prescriptionService.findById(req.params.id);
      sendSuccess(res, prescription);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const prescription = await prescriptionService.create(req.body);
      sendCreated(res, prescription, 'Prescription created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const prescription = await prescriptionService.update(req.params.id, req.body);
      sendSuccess(res, prescription, 'Prescription updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await prescriptionService.delete(req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const prescriptionController = new PrescriptionController();
