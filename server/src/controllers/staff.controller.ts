import { Request, Response, NextFunction } from 'express';
import { staffService } from '../services/staff.service.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';

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
      sendCreated(res, staff, 'Staff created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const staff = await staffService.update(req.params.id, req.body);
      sendSuccess(res, staff, 'Staff updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await staffService.delete(req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const staffController = new StaffController();
