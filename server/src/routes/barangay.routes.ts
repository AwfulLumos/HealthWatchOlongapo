import { Router } from 'express';
import { barangayController } from '../controllers/barangay.controller.js';
import { authenticate } from '../middlewares/index.js';

const router = Router();

router.use(authenticate);

router.get('/', barangayController.findAll.bind(barangayController));

export default router;
