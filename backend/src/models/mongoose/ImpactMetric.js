import mongoose from 'mongoose';

const impactMetricSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      unique: true,
    },
    mealsRescued: {
      type: Number,
      default: 0,
    },
    co2AvoidedKg: {
      type: Number,
      default: 0.0,
    },
    waterSavedLiters: {
      type: Number,
      default: 0.0,
    },
    peopleFed: {
      type: Number,
      default: 0,
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const ImpactMetric =
  mongoose.models.ImpactMetric || mongoose.model('ImpactMetric', impactMetricSchema);
export default ImpactMetric;
