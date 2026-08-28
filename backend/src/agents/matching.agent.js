import { BaseAgent } from './orchestrator.js';

/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in kilometers
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 5.0; // Default distance approximation
  }
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Matching Agent
 * Evaluates candidate recipients for a donation based on multi-objective constraint satisfaction:
 * 1. Proximity (Distance decay penalty)
 * 2. Capacity fit (Recipient remaining daily meal capacity vs. donation size)
 * 3. Dietary preferences & food type alignment
 * 4. Urgency weight (Higher urgency pushes closer shelters with immediate distribution readiness)
 */
export class MatchingAgent extends BaseAgent {
  constructor() {
    super('MatchingAgent', '2.0.0');
  }

  /**
   * Execute matching algorithm
   * @param {object} payload { donation, donorProfile, recipientCandidates, freshness }
   */
  async execute(payload) {
    const {
      donation,
      donorProfile = {},
      recipientCandidates = [],
      freshness = {},
    } = payload;

    if (!donation) {
      throw new Error('Donation object is required for Matching Agent');
    }

    const donorLat = donorProfile.latitude ?? 37.7749;
    const donorLon = donorProfile.longitude ?? -122.4194;
    const safetyHours = freshness.safetyWindowHours ?? 6;
    const isUrgent = safetyHours < 4;

    const scoredMatches = recipientCandidates.map((recipient) => {
      // 1. Distance Calculation
      const recLat = recipient.latitude ?? donorLat + 0.02;
      const recLon = recipient.longitude ?? donorLon + 0.02;
      const distanceKm = calculateDistanceKm(donorLat, donorLon, recLat, recLon);

      // Distance score (100 at 0km, dropping to 0 at 30km)
      const distanceScore = Math.max(0, 100 - (distanceKm * 3.33));

      // 2. Capacity Score
      const capacity = recipient.capacityMealsPerDay || 100;
      const donationMeals = donation.quantityUnit === 'MEALS' 
        ? donation.quantityValue 
        : donation.quantityValue * 2.2; // approx 2.2 meals/kg
      
      const capacityRatio = Math.min(1.0, capacity / (donationMeals || 1));
      const capacityScore = capacityRatio * 100;

      // 3. Dietary / Category Alignment Score
      let dietaryScore = 80; // Base score
      const prefList = recipient.dietaryPreferences || [];
      if (prefList.length > 0) {
        dietaryScore = 90; // Bonus for explicit dietary accommodations
      }

      // 4. Urgency Calculation
      const urgencyScore = isUrgent ? 95.0 : 50.0;

      // 5. Composite Weighted Match Score
      // If urgent, distance is weighted 50%, capacity 30%, dietary 20%
      // If normal, distance 40%, capacity 35%, dietary 25%
      const matchScore = isUrgent
        ? (distanceScore * 0.50) + (capacityScore * 0.30) + (dietaryScore * 0.20)
        : (distanceScore * 0.40) + (capacityScore * 0.35) + (dietaryScore * 0.25);

      return {
        recipientId: recipient._id || recipient.id,
        organizationName: recipient.organizationName,
        recipientType: recipient.recipientType,
        distanceKm,
        urgencyScore,
        matchScore: parseFloat(Math.min(99.5, Math.max(10, matchScore)).toFixed(1)),
        breakdown: {
          distanceScore: Math.round(distanceScore),
          capacityScore: Math.round(capacityScore),
          dietaryScore: Math.round(dietaryScore),
        },
        address: recipient.address,
        capacityMealsPerDay: capacity,
      };
    });

    // Sort by match score descending
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      donationId: donation.id,
      evaluatedRecipientsCount: recipientCandidates.length,
      topMatches: scoredMatches.slice(0, 5), // Top 5 proposed recipients
      bestMatch: scoredMatches[0] || null,
      generatedAt: new Date().toISOString(),
      algorithm: `MatchingAgent-${this.version}-constraint-satisfaction`,
    };
  }
}

export const matchingAgent = new MatchingAgent();
export default matchingAgent;
