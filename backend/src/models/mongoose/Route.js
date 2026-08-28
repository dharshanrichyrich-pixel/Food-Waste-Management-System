import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      index: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VolunteerProfile',
      required: true,
      index: true,
    },
    waypoints: {
      type: Array,
      default: [],
    },
    totalDistanceKm: {
      type: Number,
      default: 0.0,
    },
    estimatedDurationMin: {
      type: Number,
      default: 0.0,
    },
    optimizedRoutePolyline: {
      type: String,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);
export default Route;
