import express from 'express';
import { orchestrator } from '../../agents/orchestrator.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const router = express.Router();

/**
 * GET /api/v1/jobs/:id
 * Poll async agent job status
 */
router.get('/:id', async (req, res, next) => {
  try {
    const job = await orchestrator.getJobStatus(req.params.id);
    if (!job) {
      return sendError(res, 'Job not found', 404);
    }
    return sendSuccess(res, job, 'Job status fetched successfully');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/jobs
 * List recent agent job execution logs
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const jobs = await orchestrator.listRecentJobs(limit);
    return sendSuccess(res, jobs, 'Recent jobs retrieved successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
