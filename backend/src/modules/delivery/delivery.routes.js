import express from 'express';
import { DeliveryController } from './delivery.controller.js';

const router = express.Router();

router.get('/', DeliveryController.listDeliveries);
router.get('/:id', DeliveryController.getDelivery);
router.patch('/:id/status', DeliveryController.updateStatus);
router.post('/:id/proof', DeliveryController.submitProof);

export default router;
