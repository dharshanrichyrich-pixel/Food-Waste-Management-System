import { DonorService } from './donor.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class DonorController {
  static async getProfile(req, res) {
    try {
      const profile = await DonorService.getProfile(req.user.id);
      return sendSuccess(res, profile, 'Donor profile retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async updateProfile(req, res) {
    try {
      const profile = await DonorService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, profile, 'Donor profile updated successfully');
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }

  static async getDonations(req, res) {
    try {
      const profile = await DonorService.getProfile(req.user.id);
      const donations = await DonorService.getDonationHistory(profile.id);
      return sendSuccess(res, donations, 'Donor donation history retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async getStats(req, res) {
    try {
      const profile = await DonorService.getProfile(req.user.id);
      const stats = await DonorService.getStats(profile.id);
      return sendSuccess(res, stats, 'Donor impact and donation statistics calculated');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }
}
