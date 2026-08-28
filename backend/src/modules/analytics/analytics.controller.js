import { AnalyticsService } from './analytics.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const AnalyticsController = {
  /**
   * GET /api/v1/analytics/impact
   */
  async getImpact(req, res, next) {
    try {
      const impact = await AnalyticsService.getGlobalImpact();
      return sendSuccess(res, impact, 'Global impact metrics retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/analytics/trends
   */
  async getTrends(req, res, next) {
    try {
      const trends = await AnalyticsService.getTrends();
      return sendSuccess(res, trends, 'Rescue trends retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/analytics/demand-forecast
   */
  async getDemandForecast(req, res, next) {
    try {
      const forecast = await AnalyticsService.getDemandForecast();
      return sendSuccess(res, forecast, 'AI Demand forecast generated');
    } catch (err) {
      next(err);
    }
  },
};
