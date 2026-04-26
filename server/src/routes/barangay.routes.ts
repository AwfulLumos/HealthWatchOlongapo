import { Router } from 'express';
import { barangayController } from '../controllers/barangay.controller.js';
import { authenticate, authorize } from '../middlewares/index.js';

const router = Router();

router.use(authenticate, authorize('Employee'));

router.get('/', barangayController.findAll.bind(barangayController));

export default router;
