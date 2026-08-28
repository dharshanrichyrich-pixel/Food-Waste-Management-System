import { MatchingService } from './matching.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const MatchingController = {
  /**
   * POST /api/v1/matches/analyze/:donationId
   * Run Food Freshness Analysis Agent
   */
  async analyzeFreshness(req, res, next) {
    try {
      const assessment = await MatchingService.analyzeDonationFreshness(req.params.donationId);
      return sendSuccess(res, assessment, 'Food Freshness Analysis completed', 200);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/matches/propose/:donationId
   * Run Recipient Matching Agent
   */
  async proposeMatches(req, res, next) {
    try {
      const result = await MatchingService.proposeMatches(req.params.donationId);
      return sendSuccess(res, result, 'Recipient Match Proposals generated', 200);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/matches/:id/accept
   * Recipient accepts proposal
   */
  async acceptMatch(req, res, next) {
    try {
      const match = await MatchingService.acceptMatch(req.params.id);
      return sendSuccess(res, match, 'Match proposal accepted successfully', 200);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/matches/:id/decline
   * Recipient declines proposal
   */
  async declineMatch(req, res, next) {
    try {
      const match = await MatchingService.declineMatch(req.params.id);
      return sendSuccess(res, match, 'Match proposal declined', 200);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/matches/recipient/:recipientId
   * Get all matches for recipient
   */
  async getRecipientMatches(req, res, next) {
    try {
      const matches = await MatchingService.getRecipientMatches(req.params.recipientId);
      return sendSuccess(res, matches, 'Recipient matches retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  },
};
