import { Router } from 'express';
import { consultationController } from '../controllers/consultation.controller.js';
import { validate, authenticate, authorize } from '../middlewares/index.js';
import {
  createConsultationSchema,
  updateConsultationSchema,
  consultationIdParamSchema,
} from '../validators/consultation.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', consultationController.findAll.bind(consultationController));
router.get(
  '/creation-options',
  authorize('Admin', 'Doctor', 'Nurse', 'Midwife'),
  consultationController.getCreationOptions.bind(consultationController)
);
router.get('/:id', validate(consultationIdParamSchema), consultationController.findById.bind(consultationController));
router.post(
  '/',
  authorize('Admin', 'Doctor', 'Nurse', 'Midwife'),
  validate(createConsultationSchema),
  consultationController.create.bind(consultationController)
);
router.patch(
  '/:id',
  authorize('Admin', 'Doctor', 'Nurse', 'Midwife'),
  validate(updateConsultationSchema),
  consultationController.update.bind(consultationController)
);
router.delete(
  '/:id',
  authorize('Admin', 'Doctor'),
  validate(consultationIdParamSchema),
  consultationController.delete.bind(consultationController)
);

export default router;
