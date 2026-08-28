import { LogisticsService } from './logistics.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const LogisticsController = {
  /**
   * GET /api/v1/logistics/map-data
   * Real Coimbatore telemetry for donors, shelters, couriers, surplus batches and OSRM routes
   */
  async getLiveMapData(req, res, next) {
    try {
      const mapData = await LogisticsService.getLiveMapData();
      return sendSuccess(res, mapData, 'Real Coimbatore map telemetry and OSRM routes loaded', 200);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/logistics/optimize-route
   */
  async optimizeRoute(req, res, next) {
    try {
      const result = await LogisticsService.optimizeRoute(req.body);
      return sendSuccess(res, result, 'Route optimized successfully with Logistics Agent', 200);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/logistics/routes/:volunteerId
   */
  async getActiveRoute(req, res, next) {
    try {
      const route = await LogisticsService.getActiveRoute(req.params.volunteerId);
      return sendSuccess(res, route, 'Active route retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  },
};

export default LogisticsController;
