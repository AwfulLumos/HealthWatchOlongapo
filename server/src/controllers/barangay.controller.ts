import { Request, Response, NextFunction } from 'express';
import { barangayService } from '../services/barangay.service.js';
import { sendSuccess } from '../utils/response.js';

export class BarangayController {
  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barangays = await barangayService.findAll();
      sendSuccess(res, barangays);
    } catch (error) {
      next(error);
    }
  }
}

export const barangayController = new BarangayController();
