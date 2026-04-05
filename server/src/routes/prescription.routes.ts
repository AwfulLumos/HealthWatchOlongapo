import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller.js';
import { validate, authenticate, authorize } from '../middlewares/index.js';
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  prescriptionIdParamSchema,
} from '../validators/prescription.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', prescriptionController.findAll.bind(prescriptionController));
router.get('/:id', validate(prescriptionIdParamSchema), prescriptionController.findById.bind(prescriptionController));
router.post(
  '/',
  authorize('Admin', 'Doctor'),
  validate(createPrescriptionSchema),
  prescriptionController.create.bind(prescriptionController)
);
router.patch(
  '/:id',
  authorize('Admin', 'Doctor'),
  validate(updatePrescriptionSchema),
  prescriptionController.update.bind(prescriptionController)
);
router.delete(
  '/:id',
  authorize('Admin', 'Doctor'),
  validate(prescriptionIdParamSchema),
  prescriptionController.delete.bind(prescriptionController)
);

export default router;
