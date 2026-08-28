import express from 'express';
import { AnalyticsController } from './analytics.controller.js';

const router = express.Router();

router.get('/impact', AnalyticsController.getImpact);
router.get('/trends', AnalyticsController.getTrends);
router.get('/demand-forecast', AnalyticsController.getDemandForecast);

export default router;
