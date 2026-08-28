import express from 'express';
import { VolunteerController } from './volunteer.controller.js';

const router = express.Router();

router.get('/profile', VolunteerController.getProfile);
router.put('/profile', VolunteerController.updateProfile);
router.patch('/availability', VolunteerController.toggleAvailability);
router.get('/tasks', VolunteerController.getTasks);
router.post('/dispatch/:matchId', VolunteerController.dispatchDelivery);

export default router;
