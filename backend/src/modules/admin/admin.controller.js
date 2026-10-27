import { AdminService } from './admin.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const AdminController = {
  /**
   * GET /api/v1/admin/users
   * Lists all users from MongoDB
   */
  async listUsers(req, res, next) {
    try {
      const users = await AdminService.listUsers();
      return sendSuccess(res, users, 'MongoDB users list retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/admin/login-logs
   * Lists chronological login audit events from MongoDB
   */
  async listLoginLogs(req, res, next) {
    try {
      const logs = await AdminService.listLoginLogs();
      return sendSuccess(res, logs, 'User login audit logs retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/admin/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const updated = await AdminService.updateUserStatus(req.params.id, req.body);
      return sendSuccess(res, updated, 'User status updated in MongoDB');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/admin/telemetry
   */
  async getTelemetry(req, res, next) {
    try {
      const telemetry = await AdminService.getAgentTelemetry();
      return sendSuccess(res, telemetry, 'Agent Swarm telemetry retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/admin/donations/:id/moderate
   */
  async moderateDonation(req, res, next) {
    try {
      const { action, notes } = req.body;
      const result = await AdminService.moderateDonation(req.params.id, action, notes);
      return sendSuccess(res, result, `Donation ${action} action applied`);
    } catch (err) {
      next(err);
    }
  },
};
