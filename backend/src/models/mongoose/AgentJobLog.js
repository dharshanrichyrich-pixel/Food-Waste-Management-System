import mongoose from 'mongoose';

const agentJobLogSchema = new mongoose.Schema(
  {
    agentName: {
      type: String,
      required: true,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    inputPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    outputPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    executionTimeMs: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['QUEUED', 'PROCESSING', 'SUCCESS', 'FAILED'],
      default: 'QUEUED',
      index: true,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const AgentJobLog =
  mongoose.models.AgentJobLog || mongoose.model('AgentJobLog', agentJobLogSchema);
export default AgentJobLog;
