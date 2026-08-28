import { BaseAgent } from './orchestrator.js';
import { calculateDistanceKm } from './matching.agent.js';

const VEHICLE_CAPACITY_KG = {
  BICYCLE: 15,
  MOTORCYCLE: 25,
  CAR: 75,
  VAN: 350,
  TRUCK: 1200,
};

/**
 * Volunteer Agent
 * Autonomous dispatcher identifying available volunteers near a pickup location,
 * matching vehicle capacity, and assigning tasks.
 */
export class VolunteerAgent extends BaseAgent {
  constructor() {
    super('VolunteerAgent', '1.5.0');
  }

  /**
   * Dispatch delivery to candidate volunteers
   * @param {object} payload { pickupLocation, dropoffLocation, payloadWeightKg, availableVolunteers }
   */
  async execute(payload) {
    const {
      pickupLocation = { latitude: 37.7749, longitude: -122.4194 },
      dropoffLocation = { latitude: 37.7833, longitude: -122.4167 },
      payloadWeightKg = 15,
      availableVolunteers = [],
    } = payload;

    if (!availableVolunteers || availableVolunteers.length === 0) {
      return {
        matched: false,
        message: 'No available volunteers found online in this area',
        bestVolunteer: null,
        rankedCandidates: [],
      };
    }

    const scoredVolunteers = availableVolunteers
      .map((vol) => {
        const volLat = vol.currentLatitude ?? pickupLocation.latitude + 0.01;
        const volLon = vol.currentLongitude ?? pickupLocation.longitude + 0.01;
        const distanceToPickupKm = calculateDistanceKm(
          volLat,
          volLon,
          pickupLocation.latitude,
          pickupLocation.longitude
        );

        const vehicleCapacity = vol.vehicleCapacityKg || VEHICLE_CAPACITY_KG[vol.vehicleType?.toUpperCase()] || 50;
        const canFitPayload = vehicleCapacity >= payloadWeightKg;

        // Proximity score (100 at 0km, 0 at 25km)
        const proximityScore = Math.max(0, 100 - (distanceToPickupKm * 4.0));
        const capacityFitScore = canFitPayload ? 100 : 20;

        const totalScore = (proximityScore * 0.70) + (capacityFitScore * 0.30);

        return {
          volunteerId: vol.id,
          userId: vol.userId,
          fullName: vol.fullName,
          vehicleType: vol.vehicleType,
          vehicleCapacityKg: vehicleCapacity,
          distanceToPickupKm,
          canFitPayload,
          dispatchScore: parseFloat(totalScore.toFixed(1)),
        };
      })
      .filter((v) => v.canFitPayload)
      .sort((a, b) => b.dispatchScore - a.dispatchScore);

    const bestVolunteer = scoredVolunteers[0] || null;

    return {
      matched: !!bestVolunteer,
      bestVolunteer,
      rankedCandidates: scoredVolunteers.slice(0, 5),
      evaluatedCount: availableVolunteers.length,
      dispatchedAt: new Date().toISOString(),
      algorithm: `VolunteerAgent-${this.version}-geofenced-dispatch`,
    };
  }
}

export const volunteerAgent = new VolunteerAgent();
export default volunteerAgent;
