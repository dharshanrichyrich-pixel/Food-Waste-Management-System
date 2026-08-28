import { NotificationService } from './notification.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const NotificationController = {
  /**
   * GET /api/v1/notifications
   */
  async listNotifications(req, res, next) {
    try {
      const userId = req.user?.id || req.query.userId || 'test-user-1';
      const list = await NotificationService.listUserNotifications(userId);
      return sendSuccess(res, list, 'Notifications retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/notifications/unread-count
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user?.id || req.query.userId || 'test-user-1';
      const count = await NotificationService.getUnreadCount(userId);
      return sendSuccess(res, { unreadCount: count }, 'Unread count fetched');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/notifications/:id/read
   */
  async markRead(req, res, next) {
    try {
      const result = await NotificationService.markAsRead(req.params.id);
      return sendSuccess(res, result, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/notifications/read-all
   */
  async markAllRead(req, res, next) {
    try {
      const userId = req.user?.id || req.body.userId || 'test-user-1';
      const result = await NotificationService.markAllAsRead(userId);
      return sendSuccess(res, result, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/notifications/send
   */
  async send(req, res, next) {
    try {
      const result = await NotificationService.sendNotification(req.body);
      return sendSuccess(res, result, 'Notification sent successfully', 201);
    } catch (err) {
      next(err);
    }
  },
};
