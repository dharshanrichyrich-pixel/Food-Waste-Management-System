import {
  Donation,
  DonorProfile,
  RecipientProfile,
  Match,
} from '../../models/mongoose/index.js';
import { orchestrator } from '../../agents/orchestrator.js';
import { foodAgent } from '../../agents/food.agent.js';
import { matchingAgent } from '../../agents/matching.agent.js';
import { emitToRole } from '../../websocket/socket.js';

// Register Agents with Orchestrator
orchestrator.registerAgent('FoodAgent', foodAgent);
orchestrator.registerAgent('MatchingAgent', matchingAgent);

export const MatchingService = {
  /**
   * Run Food Freshness Analysis and persist assessment
   */
  async analyzeDonationFreshness(donationId) {
    const donation = await Donation.findById(donationId).populate('donorId');
    if (!donation) {
      throw new Error(`Donation ${donationId} not found`);
    }

    const foodAnalysis = await orchestrator.executeDirect('FoodAgent', {
      donationId: donation._id.toString(),
      foodCategory: donation.foodCategory,
      preparedAt: donation.preparedAt,
      storageTemp: donation.storageTemp,
      quantityValue: donation.quantityValue,
      imageUrls: donation.imageUrls || [],
    });

    const assessmentResult = foodAnalysis.result;
    donation.freshness = assessmentResult;
    donation.status = assessmentResult.recommendation === 'DISCARD' ? 'EXPIRED' : 'ANALYZED';
    await donation.save();

    return donation.freshness;
  },

  /**
   * Run Recipient Matching Agent and create proposed match records
   */
  async proposeMatches(donationId) {
    const donation = await Donation.findById(donationId).populate('donorId');
    if (!donation) {
      throw new Error(`Donation ${donationId} not found`);
    }

    const recipients = await RecipientProfile.find();
    if (recipients.length === 0) {
      throw new Error('No registered recipients found in system');
    }

    const matchAnalysis = await orchestrator.executeDirect('MatchingAgent', {
      donation: donation.toObject(),
      donorProfile: donation.donorId?.toObject?.() || {},
      recipientCandidates: recipients.map((r) => r.toObject()),
      freshness: donation.freshness || {},
    });

    const topMatches = matchAnalysis.result.topMatches || [];
    const createdMatches = [];

    for (const matchProposal of topMatches) {
      const matchRecord = await Match.create({
        donationId: donation._id,
        recipientId: matchProposal.recipientId,
        matchScore: matchProposal.matchScore,
        distanceKm: matchProposal.distanceKm,
        urgencyScore: matchProposal.urgencyScore,
        status: 'PROPOSED',
      });
      createdMatches.push(matchRecord);
    }

    donation.status = 'MATCH_PROPOSED';
    await donation.save();

    try {
      emitToRole('recipient', 'match:new_proposal', {
        donationId: donation._id,
        matchCount: createdMatches.length,
      });
    } catch (wsErr) {
      // ignore
    }

    return {
      donationId: donation._id,
      matches: createdMatches,
      bestMatch: createdMatches[0] || null,
    };
  },

  /**
   * Recipient accepts a match proposal
   */
  async acceptMatch(matchId) {
    const match = await Match.findByIdAndUpdate(
      matchId,
      { $set: { status: 'ACCEPTED', respondedAt: new Date() } },
      { new: true }
    ).populate('donationId recipientId');

    if (!match) throw new Error('Match proposal not found');

    await Donation.findByIdAndUpdate(match.donationId._id || match.donationId, {
      $set: { status: 'MATCHED' },
    });

    // Decline other proposals for this donation
    await Match.updateMany(
      {
        donationId: match.donationId._id || match.donationId,
        _id: { $ne: match._id },
        status: 'PROPOSED',
      },
      { $set: { status: 'DECLINED', respondedAt: new Date() } }
    );

    try {
      emitToRole('volunteer', 'delivery:dispatch_ready', {
        matchId: match._id,
        donationId: match.donationId._id || match.donationId,
      });
    } catch (wsErr) {
      // ignore
    }

    return match;
  },

  /**
   * Recipient declines a match proposal
   */
  async declineMatch(matchId) {
    return await Match.findByIdAndUpdate(
      matchId,
      { $set: { status: 'DECLINED', respondedAt: new Date() } },
      { new: true }
    );
  },

  /**
   * List matches for a recipient
   */
  async getRecipientMatches(recipientId) {
    return await Match.find({ recipientId })
      .populate({
        path: 'donationId',
        populate: { path: 'donorId' },
      })
      .sort({ matchedAt: -1 });
  },
};

export default MatchingService;
