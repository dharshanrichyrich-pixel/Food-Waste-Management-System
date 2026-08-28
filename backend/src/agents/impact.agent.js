import { BaseAgent } from './orchestrator.js';
import { ImpactMetric } from '../models/mongoose/ImpactMetric.js';

/**
 * Impact Agent
 * Aggregates completed surplus food rescues into quantified environmental & human metrics:
 * - Meals Rescued
 * - CO2 Equivalent Avoided
 * - Water Footprint Saved
 * - People Fed
 */
export class ImpactAgent extends BaseAgent {
  constructor() {
    super('ImpactAgent', '1.4.0');
  }

  /**
   * Calculate sustainability and social metrics
   */
  async execute(payload) {
    const {
      donationId,
      quantityKg = 10,
      foodCategory = 'COOKED_MEALS',
    } = payload;

    // Environmental Footprint Multipliers
    const CO2_FACTOR_KG = 2.5; // 2.5 kg CO2 avoided per kg food rescued
    const WATER_FACTOR_LITERS = 290; // 290 liters agricultural water saved per kg
    const MEALS_PER_KG = 2.2; // 2.2 meals per kg
    const PEOPLE_FED_RATIO = 1.8; // 1.8 people served per kg

    const mealsRescued = Math.max(1, Math.round(quantityKg * MEALS_PER_KG));
    const co2AvoidedKg = parseFloat((quantityKg * CO2_FACTOR_KG).toFixed(2));
    const waterSavedLiters = Math.round(quantityKg * WATER_FACTOR_LITERS);
    const peopleFed = Math.max(1, Math.round(quantityKg * PEOPLE_FED_RATIO));

    // Persist to MongoDB ImpactMetric
    if (donationId) {
      try {
        await ImpactMetric.findOneAndUpdate(
          { donationId },
          {
            $set: {
              mealsRescued,
              co2AvoidedKg,
              waterSavedLiters,
              peopleFed,
              calculatedAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
      } catch (e) {}
    }

    return {
      donationId,
      mealsRescued,
      co2AvoidedKg,
      waterSavedLiters,
      peopleFed,
      foodCategory,
      calculatedAt: new Date().toISOString(),
      version: `ImpactAgent-${this.version}`,
    };
  }
}

export const impactAgent = new ImpactAgent();
export default impactAgent;
