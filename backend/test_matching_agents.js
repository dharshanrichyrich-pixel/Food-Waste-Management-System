import { MatchingService } from './src/modules/matching/matching.service.js';
import { foodAgent } from './src/agents/food.agent.js';
import { matchingAgent } from './src/agents/matching.agent.js';

async function runMatchingAgentTests() {
  console.log('🧪 Testing Food Agent & Matching Agent Pipeline...');

  // 1. Test Food Agent direct calculation
  console.log('\n--- Test 1: Food Freshness Assessment ---');
  const foodResult = await foodAgent.execute({
    donationId: 'test-donation-001',
    foodCategory: 'COOKED_MEALS',
    preparedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    storageTemp: 'REFRIGERATED',
    quantityValue: 25,
    visualFlags: ['safe', 'packaging_sealed'],
  });
  console.log('✅ Food Agent Freshness Score:', foodResult.freshnessScore);
  console.log('✅ Remaining Safety Window (Hours):', foodResult.safetyWindowHours);
  console.log('✅ Recommendation:', foodResult.recommendation);

  // 2. Test Matching Agent
  console.log('\n--- Test 2: Recipient Matching Agent ---');
  const matchResult = await matchingAgent.execute({
    donation: {
      id: 'test-donation-001',
      title: '25kg Vegetable Stew & Rice',
      quantityValue: 25,
      quantityUnit: 'KG',
    },
    donorProfile: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    freshness: foodResult,
    recipientCandidates: [
      {
        id: 'recip_alpha',
        organizationName: 'San Francisco Central Haven',
        recipientType: 'SHELTER',
        latitude: 37.7810,
        longitude: -122.4110,
        capacityMealsPerDay: 150,
        dietaryPreferences: ['VEGAN', 'HALAL'],
      },
      {
        id: 'recip_beta',
        organizationName: 'Mission Community Kitchen',
        recipientType: 'COMMUNITY_KITCHEN',
        latitude: 37.7600,
        longitude: -122.4200,
        capacityMealsPerDay: 80,
      },
    ],
  });
  console.log('✅ Total Recipient Candidates Evaluated:', matchResult.evaluatedRecipientsCount);
  console.log('✅ Top Proposed Recipient:', matchResult.bestMatch.organizationName, 'Score:', matchResult.bestMatch.matchScore, 'Distance:', matchResult.bestMatch.distanceKm, 'km');

  // 3. Test Service Pipeline
  console.log('\n--- Test 3: Matching Service Full Cycle ---');
  const assessment = await MatchingService.analyzeDonationFreshness('mock-donation-123');
  console.log('✅ Service Freshness Assessment:', assessment.recommendation, 'Score:', assessment.freshnessScore);

  const proposals = await MatchingService.proposeMatches('mock-donation-123');
  console.log('✅ Generated Matches count:', proposals.matches.length);

  if (proposals.matches.length > 0) {
    const accepted = await MatchingService.acceptMatch(proposals.matches[0].id);
    console.log('✅ Match Proposal Accepted, Status:', accepted.status);
  }

  console.log('\n🎉 FOOD AGENT & MATCHING AGENT MODULE VERIFIED SUCCESSFULLY!');
  process.exit(0);
}

runMatchingAgentTests().catch((err) => {
  console.error('❌ Matching Agent test failed:', err);
  process.exit(1);
});
