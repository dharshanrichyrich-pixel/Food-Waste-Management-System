import express from 'express';
import { NotificationController } from './notification.controller.js';

const router = express.Router();

router.get('/', NotificationController.listNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/:id/read', NotificationController.markRead);
router.patch('/read-all', NotificationController.markAllRead);
router.post('/send', NotificationController.send);

export default router;
