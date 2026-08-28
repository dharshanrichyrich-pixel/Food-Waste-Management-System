import { Router } from 'express';
import { DonorController } from './donor.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = Router();

// Protected donor endpoints
router.use(protect);
router.use(restrictTo('donor', 'admin'));

router.get('/profile', DonorController.getProfile);
router.put('/profile', DonorController.updateProfile);
router.get('/donations', DonorController.getDonations);
router.get('/stats', DonorController.getStats);

export default router;
