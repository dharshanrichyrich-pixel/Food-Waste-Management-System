import { Donation, DonorProfile, Match, RecipientProfile, FoodItem } from '../../models/mongoose/index.js';
import { foodAgent } from '../../agents/food.agent.js';
import { matchingAgent } from '../../agents/matching.agent.js';
import { emitToRole } from '../../websocket/socket.js';

export class DonationService {
  static async createDonation(donorId, donationData) {
    const {
      title,
      description,
      foodCategory = 'COOKED_MEALS',
      quantityValue = 10,
      quantityUnit = 'KG',
      preparedAt = new Date(),
      expiryEstimatedAt = new Date(Date.now() + 6 * 60 * 60 * 1000),
      storageTemp = 'REFRIGERATED',
      items = [],
      imageUrls = [],
    } = donationData;

    // 1. Create Donation Record in MongoDB
    const donation = await Donation.create({
      donorId,
      title,
      description,
      foodCategory,
      quantityValue: parseFloat(quantityValue),
      quantityUnit,
      preparedAt: new Date(preparedAt),
      expiryEstimatedAt: new Date(expiryEstimatedAt),
      storageTemp,
      status: 'PENDING_ANALYSIS',
      imageUrls:
        imageUrls.length > 0
          ? imageUrls
          : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'],
      items: (items.length > 0
        ? items
        : [{ name: title || 'Prepared Food Platter', quantity: quantityValue, unit: quantityUnit }]
      ).map((it) => ({
        name: it.name || 'Surplus item',
        quantity: parseFloat(it.quantity || 1),
        unit: it.unit || 'KG',
        notes: it.notes || '',
      })),
    });

    // 1b. Create individual FoodItem records linked to this donation
    try {
      if (donation.items && donation.items.length > 0) {
        await FoodItem.insertMany(
          donation.items.map((it) => ({
            donationId: donation._id,
            name: it.name,
            quantity: it.quantity,
            unit: it.unit,
            category: donation.foodCategory,
            notes: it.notes,
          }))
        );
      }
    } catch (itemErr) {
      console.warn('[DonationService] FoodItem insert note:', itemErr.message);
    }

    // 2. Autonomous FoodAgent Freshness Evaluation
    try {
      const freshnessResult = await foodAgent.execute({
        donationId: donation._id.toString(),
        foodCategory,
        preparedAt,
        storageTemp,
        quantityValue,
        imageUrls,
      });

      donation.freshness = freshnessResult;
      donation.status = 'ANALYZED';
      await donation.save();
    } catch (agentErr) {
      console.warn('[DonationService] FoodAgent evaluation note:', agentErr.message);
    }

    // 3. Autonomous MatchingAgent Shelter Proposals
    try {
      const donor = await DonorProfile.findById(donorId);
      const recipientCandidates = await RecipientProfile.find();

      if (recipientCandidates.length > 0) {
        const matchResult = await matchingAgent.execute({
          donation: donation.toObject(),
          donorProfile: donor?.toObject() || {},
          recipientCandidates: recipientCandidates.map((r) => r.toObject()),
          freshness: donation.freshness || {},
        });

        if (matchResult.topMatches && matchResult.topMatches.length > 0) {
          for (const matchCandidate of matchResult.topMatches) {
            await Match.create({
              donationId: donation._id,
              recipientId: matchCandidate.recipientId,
              matchScore: matchCandidate.matchScore,
              distanceKm: matchCandidate.distanceKm,
              urgencyScore: matchCandidate.urgencyScore,
              status: 'PROPOSED',
            });
          }
          donation.status = 'MATCH_PROPOSED';
          await donation.save();
        }
      }
    } catch (matchingErr) {
      console.warn('[DonationService] MatchingAgent proposal note:', matchingErr.message);
    }

    // 4. WebSocket Broadcast
    try {
      emitToRole('admin', 'donation:new_submission', donation);
      emitToRole('recipient', 'donation:new_submission', donation);
    } catch (wsErr) {
      // ignore
    }

    return await Donation.findById(donation._id).populate('donorId');
  }

  static async getDonationById(id) {
    const donation = await Donation.findById(id).populate('donorId');
    if (!donation) throw new Error('Donation not found');
    return donation;
  }

  static async listDonations(filters = {}) {
    const { status, foodCategory, donorId, limit = 50 } = filters;
    const query = {};
    if (status) query.status = status;
    if (foodCategory) query.foodCategory = foodCategory;
    if (donorId) query.donorId = donorId;

    return await Donation.find(query)
      .populate('donorId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));
  }

  static async updateStatus(id, newStatus) {
    const donation = await Donation.findByIdAndUpdate(
      id,
      { $set: { status: newStatus } },
      { new: true }
    ).populate('donorId');
    if (!donation) throw new Error('Donation not found');
    return donation;
  }
}

export default DonationService;
