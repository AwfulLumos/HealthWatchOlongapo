import { Router } from 'express';
import { sysAdminController } from '../controllers/sysadmin.controller.js';
import { authenticate, authorize, validate } from '../middlewares/index.js';
import {
  updateRbacPolicySchema,
  updateSecurityControlsSchema,
  auditTrailQuerySchema,
} from '../validators/sysadmin.validator.js';

const router = Router();

// System administration endpoints are strictly Admin-only.
router.use(authenticate, authorize('Admin'));

router.get('/rbac', sysAdminController.getRbacPolicy.bind(sysAdminController));
router.put('/rbac', validate(updateRbacPolicySchema), sysAdminController.updateRbacPolicy.bind(sysAdminController));

router.get('/security', sysAdminController.getSecurityConfiguration.bind(sysAdminController));
router.put(
  '/security/controls',
  validate(updateSecurityControlsSchema),
  sysAdminController.updateSecurityControls.bind(sysAdminController)
);

router.get('/audit-trail', validate(auditTrailQuerySchema), sysAdminController.getAuditTrail.bind(sysAdminController));

export default router;
