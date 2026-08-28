import { Notification } from '../../models/mongoose/index.js';
import { orchestrator } from '../../agents/orchestrator.js';
import { notificationAgent } from '../../agents/notification.agent.js';

orchestrator.registerAgent('NotificationAgent', notificationAgent);

export const NotificationService = {
  /**
   * Send notification via Notification Agent
   */
  async sendNotification(data) {
    const agentResult = await orchestrator.executeDirect('NotificationAgent', data);

    if (data.recipientUserId) {
      await Notification.create({
        recipientUserId: data.recipientUserId,
        title: data.title || 'Platform Notification',
        body: data.message || data.body || '',
        channel: data.channel || 'IN_APP',
        metadata: data.metadata || {},
      });
    }

    return agentResult;
  },

  /**
   * List notifications for user
   */
  async listUserNotifications(userId) {
    return await Notification.find({ recipientUserId: userId })
      .sort({ createdAt: -1 })
      .limit(30);
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    return await Notification.countDocuments({
      recipientUserId: userId,
      isRead: false,
    });
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { $set: { isRead: true } },
      { new: true }
    );
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const res = await Notification.updateMany(
      { recipientUserId: userId, isRead: false },
      { $set: { isRead: true } }
    );
    return { count: res.modifiedCount };
  },
};

export default NotificationService;
