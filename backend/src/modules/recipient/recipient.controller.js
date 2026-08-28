import { RecipientService } from './recipient.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class RecipientController {
  static async getProfile(req, res) {
    try {
      const profile = await RecipientService.getProfile(req.user.id);
      return sendSuccess(res, profile, 'Recipient profile retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async updateProfile(req, res) {
    try {
      const profile = await RecipientService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, profile, 'Recipient profile updated successfully');
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }

  static async getAvailableDonations(req, res) {
    try {
      const profile = await RecipientService.getProfile(req.user.id);
      const donations = await RecipientService.getAvailableDonations(profile);
      return sendSuccess(res, donations, 'Available surplus donations loaded');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async getStats(req, res) {
    try {
      const profile = await RecipientService.getProfile(req.user.id);
      const stats = await RecipientService.getStats(profile.id);
      return sendSuccess(res, stats, 'Recipient statistics retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }
}
