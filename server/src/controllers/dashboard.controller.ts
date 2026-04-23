import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const appointments = await dashboardService.getUpcomingAppointments(limit);
      sendSuccess(res, appointments);
    } catch (error) {
      next(error);
    }
  }

  async getRecentPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const patients = await dashboardService.getRecentPatients(limit);
      sendSuccess(res, patients);
    } catch (error) {
      next(error);
    }
  }

  async getConsultationsByMonth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      const data = await dashboardService.getConsultationsByMonth(months);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getPatientsByMonth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      const data = await dashboardService.getPatientsByMonth(months);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getPatientDemographics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getPatientDemographics();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getTopDiagnoses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const data = await dashboardService.getTopDiagnoses(limit);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getDiseaseTrendAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      const topDiseases = req.query.topDiseases ? parseInt(req.query.topDiseases as string) : 5;
      const growthAlertThreshold = req.query.growthAlertThreshold
        ? parseFloat(req.query.growthAlertThreshold as string)
        : 0.3;

      const data = await dashboardService.getDiseaseTrendAnalysis(months, topDiseases, growthAlertThreshold);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
