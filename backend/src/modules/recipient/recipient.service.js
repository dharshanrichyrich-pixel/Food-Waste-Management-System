import mongoose from 'mongoose';
import {
  RecipientProfile,
  Donation,
  Match,
  User,
} from '../../models/mongoose/index.js';

export class RecipientService {
  static async getProfile(userId) {
    if (mongoose.connection.readyState === 1) {
      try {
        let profile = null;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
          profile = await RecipientProfile.findOne({ userId });
        }
        if (!profile) {
          profile = await RecipientProfile.findOne();
        }
        if (profile) return profile;
      } catch (err) {
        console.warn('[RecipientService] getProfile MongoDB error:', err.message);
      }
    }

    return {
      _id: 'recip_demo_01',
      organizationName: 'Peelamedu NGO Shelter & Food Bank',
      recipientType: 'SHELTER',
      contactPhone: '+91 98400 44556',
      address: 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004',
      latitude: 11.0267,
      longitude: 77.0055,
      capacityMealsPerDay: 250,
      dietaryPreferences: ['COOKED_FOOD', 'VEGETARIAN', 'HALAL'],
    };
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
    if (mongoose.connection.readyState === 1) {
      try {
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
      } catch (err) {
        console.warn('[RecipientService] getAvailableDonations MongoDB error:', err.message);
      }
    }

    return [
      {
        _id: 'don_demo_01',
        title: '40kg Prepared Hot Lunch Platters (Cooked Meals)',
        foodCategory: 'COOKED_MEALS',
        quantityValue: 40,
        quantityUnit: 'KG',
        storageTemp: 'HOT',
        status: 'MATCHED',
        freshness: { freshnessScore: 96, safetyWindowHours: 4 },
        donorId: { organizationName: 'The Green Bistro (Food Donor)' },
        createdAt: new Date().toISOString(),
      },
    ];
  }

  static async claimDonation(recipientId, matchId) {
    if (mongoose.connection.readyState === 1) {
      try {
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
      } catch (err) {
        console.warn('[RecipientService] claimDonation MongoDB error:', err.message);
      }
    }
    return { status: 'ACCEPTED', matchId };
  }

  static async getRecipientStats(recipientId) {
    if (mongoose.connection.readyState === 1) {
      try {
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
      } catch (err) {
        console.warn('[RecipientService] getRecipientStats MongoDB error:', err.message);
      }
    }

    return {
      totalClaimedBatches: 12,
      dailyMealsCapacity: 250,
      activeShelterMembers: 120,
      pendingProposalsCount: 3,
    };
  }
}

export default RecipientService;
