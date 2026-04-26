import { Router } from 'express';
import { consultationController } from '../controllers/consultation.controller.js';
import { validate, authenticate, authorize } from '../middlewares/index.js';
import {
  createConsultationSchema,
  updateConsultationSchema,
  consultationIdParamSchema,
} from '../validators/consultation.validator.js';

const router = Router();

router.use(authenticate, authorize('Employee'));

router.get('/', consultationController.findAll.bind(consultationController));
router.get('/creation-options', consultationController.getCreationOptions.bind(consultationController));
router.get('/:id', validate(consultationIdParamSchema), consultationController.findById.bind(consultationController));
router.post(
  '/',
  validate(createConsultationSchema),
  consultationController.create.bind(consultationController)
);
router.patch(
  '/:id',
  validate(updateConsultationSchema),
  consultationController.update.bind(consultationController)
);
router.delete(
  '/:id',
  validate(consultationIdParamSchema),
  consultationController.delete.bind(consultationController)
);

export default router;
