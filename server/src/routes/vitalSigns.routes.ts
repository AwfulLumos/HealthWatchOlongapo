import { Router } from 'express';
import { vitalSignsController } from '../controllers/vitalSigns.controller.js';
import { validate, authenticate } from '../middlewares/index.js';
import {
  createVitalSignsSchema,
  updateVitalSignsSchema,
  vitalSignsIdParamSchema,
} from '../validators/vitalSigns.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', vitalSignsController.findAll.bind(vitalSignsController));
router.get('/patient/:patientId/latest', vitalSignsController.getLatestByPatient.bind(vitalSignsController));
router.get('/:id', validate(vitalSignsIdParamSchema), vitalSignsController.findById.bind(vitalSignsController));
router.post('/', validate(createVitalSignsSchema), vitalSignsController.create.bind(vitalSignsController));
router.patch(
  '/:id',
  validate(updateVitalSignsSchema),
  vitalSignsController.update.bind(vitalSignsController)
);
router.delete(
  '/:id',
  validate(vitalSignsIdParamSchema),
  vitalSignsController.delete.bind(vitalSignsController)
);

export default router;
