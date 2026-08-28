import { Router } from 'express';
import { DonationController } from './donation.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = Router();

// Public / Authenticated read endpoints
router.get('/items/all', DonationController.getAllItems);
router.get('/', DonationController.list);
router.get('/:id/items', DonationController.getItems);
router.get('/:id', DonationController.getById);

// Donor & Admin protected endpoints
router.post('/', protect, restrictTo('donor', 'admin'), DonationController.create);
router.patch('/:id/status', protect, DonationController.updateStatus);

export default router;
