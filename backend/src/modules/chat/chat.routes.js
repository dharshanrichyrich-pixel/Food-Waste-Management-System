import express from 'express';
import { sendSuccess, sendError } from '../../utils/response.js';
import { ChatService } from './chat.service.js';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { User } from '../../models/mongoose/User.js';

const router = express.Router();

// Helper middleware to optionally extract authenticated user
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) req.user = user;
    }
  } catch (err) {
    // Optional auth, continue without user
  }
  next();
};

/**
 * Handle FoodFlow AI Assistant Chat Queries
 * POST /api/v1/chat/message
 */
router.post('/message', optionalAuth, async (req, res, next) => {
  try {
    const { message, context = {} } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return sendError(res, 'A valid non-empty message string is required', 400);
    }

    const result = await ChatService.handleMessage({
      message: message.trim(),
      context,
      user: req.user || null,
    });

    return sendSuccess(res, result, 'Chat query answered successfully');
  } catch (error) {
    console.error('[ChatRouter] Error processing chat query:', error);
    next(error);
  }
});

export default router;
