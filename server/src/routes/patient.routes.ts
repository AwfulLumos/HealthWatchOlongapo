import { Router } from 'express';
import { patientController } from '../controllers/patient.controller.js';
import { validate, authenticate, authorize } from '../middlewares/index.js';
import {
  createPatientSchema,
  updatePatientSchema,
  patientIdParamSchema,
} from '../validators/patient.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', patientController.findAll.bind(patientController));
router.get('/:id', validate(patientIdParamSchema), patientController.findById.bind(patientController));
router.post('/', validate(createPatientSchema), patientController.create.bind(patientController));
router.patch(
  '/:id',
  validate(updatePatientSchema),
  patientController.update.bind(patientController)
);
router.delete(
  '/:id',
  authorize('Admin', 'Doctor'),
  validate(patientIdParamSchema),
  patientController.delete.bind(patientController)
);

export default router;
