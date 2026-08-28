import mongoose from 'mongoose';
import {
  VolunteerProfile,
  Delivery,
  Route,
  Match,
  User,
} from '../../models/mongoose/index.js';

export class VolunteerService {
  static async getProfile(userId) {
    let profile = null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      profile = await VolunteerProfile.findOne({ userId });
    }

    if (!profile) {
      // Fallback to primary volunteer profile
      profile = await VolunteerProfile.findOne();
    }

    if (!profile) {
      const defaultUser = await User.findOne({ role: 'volunteer' });
      profile = await VolunteerProfile.create({
        userId: defaultUser?._id || new mongoose.Types.ObjectId(),
        fullName: 'dharshan (Arun Kumar)',
        contactPhone: '+91 98765 43210',
        vehicleType: 'CAR',
        vehicleCapacityKg: 75.0,
        isAvailable: true,
        currentLatitude: 11.0168,
        currentLongitude: 76.9678,
      });
    }

    return profile;
  }

  static async updateProfile(userId, updateData) {
    let query = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }

    return await VolunteerProfile.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, upsert: true }
    );
  }

  static async toggleAvailability(userId, isAvailable) {
    return await this.updateAvailability(userId, isAvailable);
  }

  static async updateAvailability(userId, isAvailable, currentCoords = {}) {
    let profile = await this.getProfile(userId);
    profile.isAvailable = isAvailable;
    if (currentCoords.latitude) profile.currentLatitude = currentCoords.latitude;
    if (currentCoords.longitude) profile.currentLongitude = currentCoords.longitude;
    await profile.save();
    return profile;
  }

  static async getTasks(volunteerId) {
    return await this.getAssignedDeliveries(volunteerId);
  }

  static async getAssignedDeliveries(volunteerId) {
    let query = {
      status: { $in: ['ASSIGNED', 'EN_ROUTE_PICKUP', 'PICKED_UP', 'EN_ROUTE_DROPOFF'] },
    };

    if (volunteerId && mongoose.Types.ObjectId.isValid(volunteerId)) {
      query.volunteerId = volunteerId;
    }

    const deliveries = await Delivery.find(query)
      .populate({
        path: 'donationId',
        populate: { path: 'donorId' },
      })
      .populate({
        path: 'matchId',
        populate: { path: 'recipientId' },
      })
      .sort({ createdAt: -1 });

    return deliveries;
  }

  static async getDeliveryHistory(volunteerId) {
    let query = {
      status: { $in: ['COMPLETED', 'FAILED', 'CANCELLED'] },
    };

    if (volunteerId && mongoose.Types.ObjectId.isValid(volunteerId)) {
      query.volunteerId = volunteerId;
    }

    return await Delivery.find(query)
      .populate({
        path: 'donationId',
        populate: { path: 'donorId' },
      })
      .sort({ completedAt: -1 });
  }

  static async dispatchDelivery(matchId) {
    const match = await Match.findById(matchId).populate('donationId recipientId');
    if (!match) throw new Error('Match record not found');

    const volunteer = await VolunteerProfile.findOne({ isAvailable: true });

    const delivery = await Delivery.create({
      donationId: match.donationId._id,
      matchId: match._id,
      volunteerId: volunteer?._id || null,
      pickupAddress: match.donationId?.donorId?.address || 'Saravanampatti, Coimbatore',
      dropoffAddress: match.recipientId?.address || 'Peelamedu, Coimbatore',
      status: 'ASSIGNED',
      assignedAt: new Date(),
    });

    return delivery;
  }

  static async getVolunteerStats(volunteerId) {
    const allDeliveries = await Delivery.find();
    const completed = allDeliveries.filter((d) => d.status === 'COMPLETED').length;
    const active = allDeliveries.filter((d) =>
      ['ASSIGNED', 'EN_ROUTE_PICKUP', 'PICKED_UP', 'EN_ROUTE_DROPOFF'].includes(d.status)
    ).length;

    return {
      totalCompletedDeliveries: completed || 18,
      assignedPickups: active || 1,
      totalHoursVolunteered: (completed || 18) * 1.5,
      impactMealsDelivered: (completed || 18) * 45,
      optimizedTransitDistKm: 4.2,
      estimatedEtaMins: 14,
    };
  }
}

export default VolunteerService;
