import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err);

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return sendError(res, { message: 'Validation Failed', details: messages }, 400);
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, `Duplicate value entered for ${field}. Please use another value.`, 409);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token. Please authenticate again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token has expired. Please refresh your session.', 401);
  }

  // Handle Prisma known request errors
  if (err.code && err.code.startsWith('P')) {
    return sendError(res, { message: 'Database query error', code: err.code, meta: err.meta }, 400);
  }

  // Generic fallback
  const statusCode = err.statusCode || 500;
  return sendError(res, err.message || 'Internal Server Error', statusCode);
};

export const notFoundHandler = (req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};
