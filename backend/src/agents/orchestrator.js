import { v4 as uuidv4 } from 'uuid';
import { AgentJobLog } from '../models/mongoose/AgentJobLog.js';
import { emitAgentJobUpdate } from '../websocket/socket.js';

/**
 * Base Agent Interface
 */
export class BaseAgent {
  constructor(name, version = '1.0.0') {
    this.name = name;
    this.version = version;
  }

  async execute(payload) {
    throw new Error(`Method 'execute' must be implemented by agent ${this.name}`);
  }
}

/**
 * MongoDB-backed Agent Job Orchestrator
 */
class AgentOrchestrator {
  constructor() {
    this.agents = new Map();
    this.queue = [];
    this.activeJobs = new Map();
    this.jobHistory = new Map();
    this.isProcessing = false;
    this.maxRetries = 2;
  }

  registerAgent(name, agentInstance) {
    this.agents.set(name, agentInstance);
  }

  getAgent(name) {
    const agent = this.agents.get(name);
    if (!agent) {
      throw new Error(`Agent '${name}' is not registered with Orchestrator`);
    }
    return agent;
  }

  async dispatch(agentName, inputPayload, options = {}) {
    if (!this.agents.has(agentName)) {
      throw new Error(`Agent '${agentName}' is not registered with Orchestrator`);
    }

    const jobId = `job_${uuidv4()}`;
    const job = {
      id: jobId,
      agentName,
      inputPayload,
      status: 'QUEUED',
      attempts: 0,
      maxRetries: options.retries ?? this.maxRetries,
      priority: options.priority || 'NORMAL',
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null,
    };

    this.jobHistory.set(jobId, job);
    await this._persistJobLog(job);

    try {
      emitAgentJobUpdate(jobId, { status: 'QUEUED', agentName });
    } catch (e) {}

    if (options.priority === 'HIGH') {
      this.queue.unshift(job);
    } else {
      this.queue.push(job);
    }

    this._processNext();
    return jobId;
  }

  async executeDirect(agentName, inputPayload) {
    const agent = this.getAgent(agentName);
    const startTime = Date.now();
    const jobId = `job_sync_${uuidv4()}`;

    const job = {
      id: jobId,
      agentName,
      inputPayload,
      status: 'PROCESSING',
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
    };

    await this._persistJobLog(job);
    try {
      emitAgentJobUpdate(jobId, { status: 'PROCESSING', agentName });
    } catch (e) {}

    try {
      const result = await agent.execute(inputPayload);
      const executionTimeMs = Date.now() - startTime;

      job.status = 'SUCCESS';
      job.result = result;
      job.executionTimeMs = executionTimeMs;
      job.completedAt = new Date().toISOString();

      await this._updateJobLog(job);
      try {
        emitAgentJobUpdate(jobId, { status: 'SUCCESS', agentName, result, executionTimeMs });
      } catch (e) {}

      return { jobId, success: true, result, executionTimeMs };
    } catch (err) {
      const executionTimeMs = Date.now() - startTime;
      job.status = 'FAILED';
      job.error = err.message;
      job.executionTimeMs = executionTimeMs;
      job.completedAt = new Date().toISOString();

      await this._updateJobLog(job);
      try {
        emitAgentJobUpdate(jobId, { status: 'FAILED', agentName, error: err.message });
      } catch (e) {}

      throw err;
    }
  }

  async _processNext() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const job = this.queue.shift();

    if (!job) {
      this.isProcessing = false;
      return;
    }

    const agent = this.agents.get(job.agentName);
    job.status = 'PROCESSING';
    job.startedAt = new Date().toISOString();
    job.attempts += 1;

    try {
      emitAgentJobUpdate(job.id, { status: 'PROCESSING', agentName: job.agentName, attempts: job.attempts });
    } catch (e) {}
    await this._updateJobLog(job);

    const startTime = Date.now();
    try {
      const result = await agent.execute(job.inputPayload);
      job.executionTimeMs = Date.now() - startTime;
      job.status = 'SUCCESS';
      job.result = result;
      job.completedAt = new Date().toISOString();

      try {
        emitAgentJobUpdate(job.id, {
          status: 'SUCCESS',
          agentName: job.agentName,
          result,
          executionTimeMs: job.executionTimeMs,
        });
      } catch (e) {}

      await this._updateJobLog(job);
    } catch (err) {
      job.executionTimeMs = Date.now() - startTime;

      if (job.attempts <= job.maxRetries) {
        job.status = 'QUEUED';
        this.queue.push(job);
      } else {
        job.status = 'FAILED';
        job.error = err.message;
        job.completedAt = new Date().toISOString();

        try {
          emitAgentJobUpdate(job.id, {
            status: 'FAILED',
            agentName: job.agentName,
            error: err.message,
          });
        } catch (e) {}
      }

      await this._updateJobLog(job);
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setImmediate(() => this._processNext());
      }
    }
  }

  async getJobStatus(jobId) {
    if (this.jobHistory.has(jobId)) {
      return this.jobHistory.get(jobId);
    }
    const log = await AgentJobLog.findOne({ jobId });
    if (!log) return null;
    return {
      id: log.jobId,
      agentName: log.agentName,
      status: log.status,
      inputPayload: log.inputPayload,
      result: log.outputPayload,
      executionTimeMs: log.executionTimeMs,
      error: log.error,
      createdAt: log.createdAt,
    };
  }

  async listRecentJobs(limit = 20) {
    try {
      const logs = await AgentJobLog.find({})
        .sort({ createdAt: -1 })
        .limit(limit);
      return logs.map((l) => ({
        id: l.jobId,
        agentName: l.agentName,
        status: l.status,
        executionTimeMs: l.executionTimeMs,
        error: l.error,
        createdAt: l.createdAt,
      }));
    } catch (e) {
      return Array.from(this.jobHistory.values()).slice(-limit).reverse();
    }
  }

  async _persistJobLog(job) {
    try {
      await AgentJobLog.create({
        jobId: job.id,
        agentName: job.agentName,
        status: job.status,
        inputPayload: job.inputPayload,
      });
    } catch (e) {}
  }

  async _updateJobLog(job) {
    this.jobHistory.set(job.id, job);
    try {
      await AgentJobLog.findOneAndUpdate(
        { jobId: job.id },
        {
          $set: {
            status: job.status,
            outputPayload: job.result,
            executionTimeMs: job.executionTimeMs || null,
            error: job.error || null,
          },
        }
      );
    } catch (e) {}
  }
}

export const orchestrator = new AgentOrchestrator();
export default orchestrator;
