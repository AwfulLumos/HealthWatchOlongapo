import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate, authenticate } from '../middlewares/index.js';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Public routes
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Protected routes
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword.bind(authController)
);

export default router;
