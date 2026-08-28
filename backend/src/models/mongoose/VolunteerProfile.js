import mongoose from 'mongoose';

const volunteerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN', 'TRUCK'],
      default: 'CAR',
    },
    vehicleCapacityKg: {
      type: Number,
      default: 50.0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    currentLatitude: {
      type: Number,
      default: 11.0168, // Default Gandhipuram, Coimbatore
    },
    currentLongitude: {
      type: Number,
      default: 76.9678,
    },
    activeHours: {
      type: String,
      default: '8:00 AM - 8:00 PM',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

volunteerProfileSchema.index({ currentLatitude: 1, currentLongitude: 1 });

export const VolunteerProfile =
  mongoose.models.VolunteerProfile || mongoose.model('VolunteerProfile', volunteerProfileSchema);
export default VolunteerProfile;
