import { DonationService } from './donation.service.js';
import { DonorService } from '../donor/donor.service.js';
import { FoodItem } from '../../models/mongoose/FoodItem.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class DonationController {
  static async create(req, res) {
    try {
      const userId = req.user?._id || req.user?.id;
      const donorProfile = await DonorService.getProfile(userId);
      const donorId = donorProfile?._id || donorProfile?.id;
      if (!donorId) {
        throw new Error('Donor profile could not be found or initialized.');
      }
      const donation = await DonationService.createDonation(donorId, req.body);
      return sendSuccess(res, donation, 'Donation submitted successfully for AI freshness analysis', 201);
    } catch (error) {
      console.error('[DonationController.create] Error:', error);
      return sendError(res, error.message, 400);
    }
  }

  static async getById(req, res) {
    try {
      const donation = await DonationService.getDonationById(req.params.id);
      return sendSuccess(res, donation, 'Donation retrieved');
    } catch (error) {
      return sendError(res, error.message, 404);
    }
  }

  static async list(req, res) {
    try {
      const donations = await DonationService.listDonations(req.query);
      return sendSuccess(res, donations, 'Donations listed successfully');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async getItems(req, res) {
    try {
      const items = await FoodItem.find({ donationId: req.params.id });
      return sendSuccess(res, items, 'Donation food items retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async getAllItems(req, res) {
    try {
      const items = await FoodItem.find().sort({ createdAt: -1 }).limit(100);
      return sendSuccess(res, items, 'Food items catalog retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const updated = await DonationService.updateStatus(req.params.id, status);
      return sendSuccess(res, updated, `Donation status updated to ${status}`);
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }
}
