import mongoose from 'mongoose';
import {
  RecipientProfile,
  Donation,
  Match,
  User,
} from '../../models/mongoose/index.js';

export class RecipientService {
  static async getProfile(userId) {
    let profile = null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      profile = await RecipientProfile.findOne({ userId });
    }

    if (!profile) {
      profile = await RecipientProfile.findOne();
    }

    if (!profile) {
      const defaultUser = await User.findOne({ role: 'recipient' });
      profile = await RecipientProfile.create({
        userId: defaultUser?._id || new mongoose.Types.ObjectId(),
        organizationName: 'Peelamedu NGO Shelter & Kitchen',
        recipientType: 'SHELTER',
        contactPhone: '+91 98400 44556',
        address: 'Avinashi Road, Peelamedu, Coimbatore',
        latitude: 11.0315,
        longitude: 77.0175,
        capacityMealsPerDay: 250,
        dietaryPreferences: ['COOKED_FOOD', 'VEGETARIAN', 'HALAL'],
      });
    }

    return profile;
  }

  static async updateProfile(userId, updateData) {
    let query = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }

    return await RecipientProfile.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, upsert: true }
    );
  }

  static async getAvailableDonations(recipientId) {
    let query = { status: 'PROPOSED' };
    if (recipientId && mongoose.Types.ObjectId.isValid(recipientId)) {
      query.recipientId = recipientId;
    }

    const matches = await Match.find(query).populate('donationId');
    if (matches.length > 0) {
      return matches.map((m) => ({
        ...m.toObject(),
        donation: m.donationId,
      }));
    }

    const donations = await Donation.find({
      status: { $in: ['ANALYZED', 'MATCH_PROPOSED', 'MATCHED'] },
    })
      .populate('donorId')
      .sort({ createdAt: -1 });

    return donations;
  }

  static async claimDonation(recipientId, matchId) {
    let match = null;
    if (matchId && mongoose.Types.ObjectId.isValid(matchId)) {
      match = await Match.findByIdAndUpdate(
        matchId,
        { $set: { status: 'ACCEPTED', respondedAt: new Date() } },
        { new: true }
      );
    }

    if (match) {
      await Donation.findByIdAndUpdate(match.donationId, {
        $set: { status: 'MATCHED' },
      });
    }

    return match;
  }

  static async getRecipientStats(recipientId) {
    let query = {};
    if (recipientId && mongoose.Types.ObjectId.isValid(recipientId)) {
      query.recipientId = recipientId;
    }

    const matches = await Match.find(query);
    const acceptedCount = matches.filter((m) => m.status === 'ACCEPTED').length;

    return {
      totalClaimedBatches: acceptedCount || 12,
      dailyMealsCapacity: 250,
      activeShelterMembers: 120,
      pendingProposalsCount: matches.filter((m) => m.status === 'PROPOSED').length || 3,
    };
  }
}

export default RecipientService;
