import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

// Public Auth Endpoints (MongoDB)
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected Auth Endpoints
router.post('/logout', protect, AuthController.logout);
router.get('/me', protect, AuthController.getMe);

export default router;
