import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      index: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VolunteerProfile',
      index: true,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    pickupLatitude: {
      type: Number,
      default: 11.0805, // Saravanampatti
    },
    pickupLongitude: {
      type: Number,
      default: 76.9942,
    },
    dropoffAddress: {
      type: String,
      required: true,
    },
    dropoffLatitude: {
      type: Number,
      default: 11.0267, // Peelamedu
    },
    dropoffLongitude: {
      type: Number,
      default: 77.0055,
    },
    courierLatitude: {
      type: Number,
      default: 11.0168, // Gandhipuram
    },
    courierLongitude: {
      type: Number,
      default: 76.9678,
    },
    actualDistanceKm: {
      type: Number,
      default: 6.2,
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 18,
    },
    routeCoordinates: {
      type: Array, // Array of [lat, lng]
      default: [],
    },
    status: {
      type: String,
      enum: [
        'ASSIGNED',
        'EN_ROUTE_PICKUP',
        'PICKED_UP',
        'EN_ROUTE_DROPOFF',
        'COMPLETED',
        'FAILED',
        'CANCELLED',
      ],
      default: 'ASSIGNED',
      index: true,
    },
    proofPhotoUrl: {
      type: String,
    },
    recipientSignatureUrl: {
      type: String,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    pickedUpAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Delivery =
  mongoose.models.Delivery || mongoose.model('Delivery', deliverySchema);
export default Delivery;
