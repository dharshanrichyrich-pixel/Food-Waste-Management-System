import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import User from '../models/mongoose/User.js';
import { sendError } from '../utils/response.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please provide a Bearer token.', 401);
    }

    // Verify JWT
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    // Fetch user from MongoDB
    let user = null;
    try {
      user = await User.findById(decoded.id).select('+role +isVerified');
    } catch (dbErr) {
      // If MongoDB is running in offline/mock mode for local dev without Mongo instance
      if (decoded.id && decoded.role) {
        user = {
          _id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          isVerified: true,
        };
      }
    }

    if (!user) {
      return sendError(res, 'User belonging to this token no longer exists.', 401);
    }

    // Attach user to request object
    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Access token expired. Please refresh your token.', 401, { code: 'TOKEN_EXPIRED' });
    }
    return sendError(res, 'Invalid access token. Authentication failed.', 401);
  }
};

export const authenticate = protect;

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Your role '${req.user?.role || 'anonymous'}' lacks permission for this resource. Required: [${roles.join(', ')}]`,
        403
      );
    }
    next();
  };
};
