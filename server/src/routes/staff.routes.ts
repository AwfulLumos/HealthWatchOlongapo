import { Router } from 'express';
import { staffController } from '../controllers/staff.controller.js';
import { validate, authenticate, authorize } from '../middlewares/index.js';
import {
  createStaffSchema,
  updateStaffSchema,
  staffIdParamSchema,
} from '../validators/staff.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate, authorize('Employee'));

router.get('/', staffController.findAll.bind(staffController));
router.get('/:id', validate(staffIdParamSchema), staffController.findById.bind(staffController));

router.post(
  '/',
  validate(createStaffSchema),
  staffController.create.bind(staffController)
);
router.patch(
  '/:id',
  validate(updateStaffSchema),
  staffController.update.bind(staffController)
);
router.delete(
  '/:id',
  validate(staffIdParamSchema),
  staffController.delete.bind(staffController)
);

export default router;
