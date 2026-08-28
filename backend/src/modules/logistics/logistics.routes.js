import express from 'express';
import { LogisticsController } from './logistics.controller.js';

const router = express.Router();

// Real Leaflet Coimbatore Map Telemetry
router.get('/map-data', LogisticsController.getLiveMapData);

router.post('/optimize-route', LogisticsController.optimizeRoute);
router.get('/routes/:volunteerId', LogisticsController.getActiveRoute);

export default router;
