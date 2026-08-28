import { BaseAgent } from './orchestrator.js';
import { emitToUser, emitToRole } from '../websocket/socket.js';
import { safePrisma } from '../config/postgres.js';
import { v4 as uuidv4 } from 'uuid';

const fallbackNotifications = new Map();

/**
 * Notification Agent
 * Autonomous messaging agent coordinating alerts across in-app WebSockets,
 * mock email, SMS, and push webhooks based on priority rules.
 */
export class NotificationAgent extends BaseAgent {
  constructor() {
    super('NotificationAgent', '1.3.0');
  }

  /**
   * Dispatch notification to user or role
   * @param {object} payload { recipientUserId, targetRole, title, body, channel, priority, metadata }
   */
  async execute(payload) {
    const {
      recipientUserId,
      targetRole,
      title,
      body,
      channel = 'IN_APP',
      priority = 'NORMAL', // LOW, NORMAL, HIGH, CRITICAL
      metadata = {},
    } = payload;

    if (!title || !body) {
      throw new Error('Notification requires title and body');
    }

    // 1. Persist notification to PostgreSQL
    const notificationRecord = await safePrisma(
      async (client) => {
        if (!recipientUserId) return null;
        return await client.notification.create({
          data: {
            recipientUserId,
            title,
            body,
            channel: channel.toUpperCase(),
            isRead: false,
            metadataJson: JSON.stringify(metadata || {}),
          },
        });
      },
      () => {
        const item = {
          id: `notif_${uuidv4()}`,
          recipientUserId: recipientUserId || 'broadcast',
          title,
          body,
          channel: channel.toUpperCase(),
          isRead: false,
          metadata,
          createdAt: new Date().toISOString(),
        };
        fallbackNotifications.set(item.id, item);
        return item;
      }
    );

    // 2. Real-time WebSocket emission
    if (recipientUserId) {
      emitToUser(recipientUserId, 'notification:received', {
        notification: notificationRecord || { title, body, channel, metadata },
        priority,
      });
    }

    if (targetRole) {
      emitToRole(targetRole, 'notification:role_broadcast', {
        title,
        body,
        targetRole,
        metadata,
      });
    }

    // 3. Simulated External Channels (SMS / Email)
    const simulatedDelivery = {
      inAppSent: true,
      emailSent: channel === 'EMAIL' || priority === 'CRITICAL',
      smsSent: channel === 'SMS' || priority === 'CRITICAL',
      pushSent: channel === 'PUSH' || priority === 'HIGH' || priority === 'CRITICAL',
    };

    return {
      notificationId: notificationRecord?.id || `sim_${Date.now()}`,
      recipientUserId,
      channel,
      priority,
      deliveredAt: new Date().toISOString(),
      channelsActivated: simulatedDelivery,
    };
  }
}

export const notificationAgent = new NotificationAgent();
export default notificationAgent;
