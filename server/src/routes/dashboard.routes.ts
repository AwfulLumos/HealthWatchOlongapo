import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/index.js';

const router = Router();

router.use(authenticate);

router.get('/stats', dashboardController.getStats.bind(dashboardController));
router.get('/upcoming-appointments', dashboardController.getUpcomingAppointments.bind(dashboardController));
router.get('/recent-patients', dashboardController.getRecentPatients.bind(dashboardController));
router.get('/consultations-by-month', dashboardController.getConsultationsByMonth.bind(dashboardController));
router.get('/patients-by-month', dashboardController.getPatientsByMonth.bind(dashboardController));
router.get('/patient-demographics', dashboardController.getPatientDemographics.bind(dashboardController));
router.get('/top-diagnoses', dashboardController.getTopDiagnoses.bind(dashboardController));
router.get('/disease-trend-analysis', dashboardController.getDiseaseTrendAnalysis.bind(dashboardController));

export default router;
