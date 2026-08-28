import express from 'express';
import { MatchingController } from './matching.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Analysis & Match Generation
router.post('/analyze/:donationId', MatchingController.analyzeFreshness);
router.post('/propose/:donationId', MatchingController.proposeMatches);

// Match Decision Actions
router.post('/:id/accept', MatchingController.acceptMatch);
router.post('/:id/decline', MatchingController.declineMatch);

// Recipient Matches View
router.get('/recipient/:recipientId', MatchingController.getRecipientMatches);

export default router;
