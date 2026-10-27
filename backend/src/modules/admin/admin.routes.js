import express from 'express';
import { AdminController } from './admin.controller.js';

const router = express.Router();

router.get('/users', AdminController.listUsers);
router.get('/login-logs', AdminController.listLoginLogs);
router.patch('/users/:id', AdminController.updateUser);
router.get('/telemetry', AdminController.getTelemetry);
router.post('/donations/:id/moderate', AdminController.moderateDonation);

export default router;
