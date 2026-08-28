import { DeliveryService } from './delivery.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const DeliveryController = {
  /**
   * GET /api/v1/deliveries/:id
   */
  async getDelivery(req, res, next) {
    try {
      const delivery = await DeliveryService.getDeliveryById(req.params.id);
      if (!delivery) return sendError(res, 'Delivery not found', 404);
      return sendSuccess(res, delivery, 'Delivery retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/deliveries
   */
  async listDeliveries(req, res, next) {
    try {
      const list = await DeliveryService.listDeliveries(req.query);
      return sendSuccess(res, list, 'Deliveries list retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/deliveries/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const updated = await DeliveryService.updateStatus(req.params.id, status);
      return sendSuccess(res, updated, `Delivery status updated to ${status}`);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/deliveries/:id/proof
   */
  async submitProof(req, res, next) {
    try {
      const updated = await DeliveryService.submitProof(req.params.id, req.body);
      return sendSuccess(res, updated, 'Proof of delivery recorded, delivery completed');
    } catch (err) {
      next(err);
    }
  },
};
