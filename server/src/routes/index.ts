import { Router } from 'express';

import authRoutes from './auth.routes.js';
import patientRoutes from './patient.routes.js';
import staffRoutes from './staff.routes.js';
import appointmentRoutes from './appointment.routes.js';
import consultationRoutes from './consultation.routes.js';
import prescriptionRoutes from './prescription.routes.js';
import vitalSignsRoutes from './vitalSigns.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import barangayRoutes from './barangay.routes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/staff', staffRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/consultations', consultationRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/vital-signs', vitalSignsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/barangays', barangayRoutes);

export default router;
