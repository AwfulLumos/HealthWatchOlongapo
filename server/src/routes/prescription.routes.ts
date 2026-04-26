import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller.js';
import { validate, authenticate, authorize } from '../middlewares/index.js';
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  prescriptionIdParamSchema,
} from '../validators/prescription.validator.js';

const router = Router();

router.use(authenticate, authorize('Employee'));

router.get('/', prescriptionController.findAll.bind(prescriptionController));
router.get('/:id', validate(prescriptionIdParamSchema), prescriptionController.findById.bind(prescriptionController));
router.post(
  '/',
  validate(createPrescriptionSchema),
  prescriptionController.create.bind(prescriptionController)
);
router.patch(
  '/:id',
  validate(updatePrescriptionSchema),
  prescriptionController.update.bind(prescriptionController)
);
router.delete(
  '/:id',
  validate(prescriptionIdParamSchema),
  prescriptionController.delete.bind(prescriptionController)
);

export default router;
