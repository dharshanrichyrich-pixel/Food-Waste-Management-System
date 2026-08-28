import { VolunteerService } from './volunteer.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const VolunteerController = {
  /**
   * GET /api/v1/volunteers/profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user?.id || req.query.userId || 'test-volunteer-user-1';
      const profile = await VolunteerService.getProfile(userId);
      return sendSuccess(res, profile, 'Volunteer profile retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/v1/volunteers/profile
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user?.id || req.body.userId || 'test-volunteer-user-1';
      const updated = await VolunteerService.updateProfile(userId, req.body);
      return sendSuccess(res, updated, 'Volunteer profile updated');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/volunteers/availability
   */
  async toggleAvailability(req, res, next) {
    try {
      const userId = req.user?.id || req.body.userId || 'test-volunteer-user-1';
      const { isAvailable } = req.body;
      const updated = await VolunteerService.toggleAvailability(userId, isAvailable !== false);
      return sendSuccess(res, updated, 'Availability status updated');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/volunteers/dispatch/:matchId
   */
  async dispatchDelivery(req, res, next) {
    try {
      const result = await VolunteerService.dispatchDelivery(req.params.matchId);
      return sendSuccess(res, result, 'Delivery task dispatched via Volunteer Agent', 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/volunteers/tasks
   */
  async getTasks(req, res, next) {
    try {
      const volunteerId = req.query.volunteerId || 'vol-demo';
      const tasks = await VolunteerService.getTasks(volunteerId);
      return sendSuccess(res, tasks, 'Volunteer tasks retrieved');
    } catch (err) {
      next(err);
    }
  },
};
