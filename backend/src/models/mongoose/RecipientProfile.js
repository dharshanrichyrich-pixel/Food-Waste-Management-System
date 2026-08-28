import mongoose from 'mongoose';

const recipientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    recipientType: {
      type: String,
      enum: ['SHELTER', 'FOOD_BANK', 'COMMUNITY_KITCHEN', 'INDIVIDUAL', 'CHARITY'],
      default: 'SHELTER',
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      default: 11.0315, // Default Peelamedu, Coimbatore
    },
    longitude: {
      type: Number,
      default: 77.0175,
    },
    capacityMealsPerDay: {
      type: Number,
      default: 120,
    },
    dietaryPreferences: {
      type: [String],
      default: ['VEGETARIAN', 'COOKED_FOOD', 'HALAL'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

recipientProfileSchema.index({ latitude: 1, longitude: 1 });

export const RecipientProfile =
  mongoose.models.RecipientProfile || mongoose.model('RecipientProfile', recipientProfileSchema);
export default RecipientProfile;
