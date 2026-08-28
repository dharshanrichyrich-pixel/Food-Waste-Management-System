import mongoose from 'mongoose';

const donationItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  unit: {
    type: String,
    default: 'KG',
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    trim: true,
  },
});

const freshnessAssessmentSchema = new mongoose.Schema({
  freshnessScore: {
    type: Number, // 0 - 100
    required: true,
  },
  safetyWindowHours: {
    type: Number, // Remaining hours safe for consumption
    required: true,
  },
  confidenceScore: {
    type: Number,
    default: 0.92,
  },
  visualDefectFlags: {
    type: [String],
    default: ['packaging_intact', 'optimal_color_profile'],
  },
  recommendation: {
    type: String,
    default: 'SAFE_FOR_DONATION',
  },
  modelVersion: {
    type: String,
    default: 'FoodAgent-v1.2.0',
  },
  evaluatedAt: {
    type: Date,
    default: Date.now,
  },
});

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Donation title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    foodCategory: {
      type: String,
      enum: ['COOKED_MEALS', 'BAKERY', 'PRODUCE', 'PACKAGED', 'DAIRY', 'BEVERAGES', 'RAW_PRODUCE', 'PACKAGED_GOODS'],
      default: 'COOKED_MEALS',
      index: true,
    },
    quantityValue: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0.1,
    },
    quantityUnit: {
      type: String,
      enum: ['KG', 'MEALS', 'BOXES', 'LITERS', 'ITEMS', 'PORTIONS', 'TRAYS'],
      default: 'KG',
    },
    preparedAt: {
      type: Date,
      default: Date.now,
    },
    expiryEstimatedAt: {
      type: Date,
    },
    storageTemp: {
      type: String,
      enum: ['FROZEN', 'REFRIGERATED', 'ROOM_TEMP', 'WARM', 'AMBIENT'],
      default: 'REFRIGERATED',
    },
    status: {
      type: String,
      enum: [
        'PENDING_ANALYSIS',
        'ANALYZED',
        'MATCH_PROPOSED',
        'MATCHED',
        'PICKED_UP',
        'DELIVERED',
        'EXPIRED',
        'CANCELLED',
      ],
      default: 'PENDING_ANALYSIS',
      index: true,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    items: [donationItemSchema],
    freshness: freshnessAssessmentSchema,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

donationSchema.index({ createdAt: -1 });

export const Donation =
  mongoose.models.Donation || mongoose.model('Donation', donationSchema);
export default Donation;
