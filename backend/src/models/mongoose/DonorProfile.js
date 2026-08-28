import mongoose from 'mongoose';

const donorProfileSchema = new mongoose.Schema(
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
      default: 11.0805, // Default Saravanampatti, Coimbatore
    },
    longitude: {
      type: Number,
      default: 76.9942,
    },
    donorType: {
      type: String,
      enum: ['RESTAURANT', 'SUPERMARKET', 'HOUSEHOLD', 'EVENT_ORGANIZER', 'CORPORATE'],
      default: 'RESTAURANT',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

donorProfileSchema.index({ latitude: 1, longitude: 1 });

export const DonorProfile =
  mongoose.models.DonorProfile || mongoose.model('DonorProfile', donorProfileSchema);
export default DonorProfile;
