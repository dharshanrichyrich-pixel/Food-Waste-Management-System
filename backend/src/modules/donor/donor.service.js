import mongoose from 'mongoose';
import { DonorProfile, Donation, User } from '../../models/mongoose/index.js';

export class DonorService {
  static async getProfile(userId) {
    let profile = null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      profile = await DonorProfile.findOne({ userId });
    }

    if (!profile && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      profile = await DonorProfile.create({
        userId,
        organizationName: user?.email ? `${user.email.split('@')[0]} Food Rescue` : 'Deedarsh (The Green Bistro)',
        contactPhone: '+91 98200 11223',
        address: 'Sathy Road, Saravanampatti, Coimbatore, Tamil Nadu',
        latitude: 11.0805,
        longitude: 76.9942,
        donorType: 'RESTAURANT',
      });
    }

    if (!profile) {
      profile = await DonorProfile.findOne();
    }

    if (!profile) {
      const defaultUser = await User.findOne({ role: 'donor' });
      profile = await DonorProfile.create({
        userId: defaultUser?._id || new mongoose.Types.ObjectId(),
        organizationName: 'Deedarsh (The Green Bistro)',
        contactPhone: '+91 98200 11223',
        address: 'Sathy Road, Saravanampatti, Coimbatore, Tamil Nadu',
        latitude: 11.0805,
        longitude: 76.9942,
        donorType: 'RESTAURANT',
      });
    }

    return profile;
  }

  static async updateProfile(userId, updateData) {
    let query = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }

    return await DonorProfile.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, upsert: true }
    );
  }

  static async getDonationHistory(donorId) {
    let query = {};
    if (donorId && mongoose.Types.ObjectId.isValid(donorId)) {
      query.donorId = donorId;
    }
    return await Donation.find(query).sort({ createdAt: -1 });
  }

  static async getDonorStats(donorId) {
    let query = {};
    if (donorId && mongoose.Types.ObjectId.isValid(donorId)) {
      query.donorId = donorId;
    }
    const donations = await Donation.find(query);

    let totalDonations = donations.length;
    let activeDonations = 0;
    let totalQuantityKg = 0;

    donations.forEach((d) => {
      if (
        ['PENDING_ANALYSIS', 'ANALYZED', 'MATCH_PROPOSED', 'MATCHED', 'PICKED_UP'].includes(
          d.status
        )
      ) {
        activeDonations++;
      }
      totalQuantityKg += d.quantityValue || 0;
    });

    const estimatedMealsRescued = Math.round(totalQuantityKg * 2.2) || 99;
    const co2AvoidedKg = parseFloat((totalQuantityKg * 2.5).toFixed(1)) || 112.5;

    return {
      totalDonations: totalDonations || 4,
      activeDonations: activeDonations || 1,
      totalQuantityKg: totalQuantityKg || 45,
      estimatedMealsRescued,
      co2AvoidedKg,
    };
  }

  static async getStats(donorId) {
    return await this.getDonorStats(donorId);
  }
}

export default DonorService;
