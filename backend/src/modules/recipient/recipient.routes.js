import { Router } from 'express';
import { RecipientController } from './recipient.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = Router();

// Protected recipient endpoints
router.use(protect);
router.use(restrictTo('recipient', 'admin'));

router.get('/profile', RecipientController.getProfile);
router.put('/profile', RecipientController.updateProfile);
router.get('/available-donations', RecipientController.getAvailableDonations);
router.get('/stats', RecipientController.getStats);

export default router;
