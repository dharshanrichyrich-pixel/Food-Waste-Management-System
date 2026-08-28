/**
 * Standard API Response Envelope
 * Format: { success: boolean, data?: any, error?: string | object, meta?: object }
 */

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
};

export const sendError = (res, error = 'An error occurred', statusCode = 500, meta = {}) => {
  const errorMessage = typeof error === 'string' ? error : (error?.message || 'Internal Server Error');
  const errorDetails = typeof error === 'object' && error !== null ? error.details || error : null;

  return res.status(statusCode).json({
    success: false,
    error: {
      message: errorMessage,
      ...(errorDetails && typeof errorDetails === 'object' && { details: errorDetails }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
};
