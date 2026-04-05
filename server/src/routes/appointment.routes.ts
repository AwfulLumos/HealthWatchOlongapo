import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller.js';
import { validate, authenticate } from '../middlewares/index.js';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdParamSchema,
} from '../validators/appointment.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', appointmentController.findAll.bind(appointmentController));
router.get('/:id', validate(appointmentIdParamSchema), appointmentController.findById.bind(appointmentController));
router.post('/', validate(createAppointmentSchema), appointmentController.create.bind(appointmentController));
router.patch(
  '/:id',
  validate(updateAppointmentSchema),
  appointmentController.update.bind(appointmentController)
);
router.delete(
  '/:id',
  validate(appointmentIdParamSchema),
  appointmentController.delete.bind(appointmentController)
);

export default router;
