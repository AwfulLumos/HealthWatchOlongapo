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
router.use(authenticate);

router.get('/', staffController.findAll.bind(staffController));
router.get('/:id', validate(staffIdParamSchema), staffController.findById.bind(staffController));

// Admin only routes
router.post(
  '/',
  authorize('Admin'),
  validate(createStaffSchema),
  staffController.create.bind(staffController)
);
router.patch(
  '/:id',
  authorize('Admin'),
  validate(updateStaffSchema),
  staffController.update.bind(staffController)
);
router.delete(
  '/:id',
  authorize('Admin'),
  validate(staffIdParamSchema),
  staffController.delete.bind(staffController)
);

export default router;
