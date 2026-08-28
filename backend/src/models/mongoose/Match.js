import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecipientProfile',
      required: true,
      index: true,
    },
    matchScore: {
      type: Number,
      required: true,
      default: 85.0,
    },
    distanceKm: {
      type: Number,
      required: true,
      default: 5.0,
    },
    urgencyScore: {
      type: Number,
      default: 50.0,
    },
    status: {
      type: String,
      enum: ['PROPOSED', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
      default: 'PROPOSED',
      index: true,
    },
    matchedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);
export default Match;
