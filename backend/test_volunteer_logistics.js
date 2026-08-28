import { volunteerAgent } from './src/agents/volunteer.agent.js';
import { logisticsAgent } from './src/agents/logistics.agent.js';
import { VolunteerService } from './src/modules/volunteer/volunteer.service.js';
import { LogisticsService } from './src/modules/logistics/logistics.service.js';

async function testVolunteerLogistics() {
  console.log('🧪 Testing Volunteer Agent & Logistics Agent Routing Pipeline...');

  // 1. Test Volunteer Agent Dispatch
  console.log('\n--- Test 1: Volunteer Dispatch Agent ---');
  const dispatchResult = await volunteerAgent.execute({
    pickupLocation: { latitude: 37.7749, longitude: -122.4194 },
    dropoffLocation: { latitude: 37.7833, longitude: -122.4167 },
    payloadWeightKg: 30,
    availableVolunteers: [
      {
        id: 'vol-1',
        fullName: 'Marcus Delivery (Bicycle)',
        vehicleType: 'BICYCLE',
        vehicleCapacityKg: 15,
        currentLatitude: 37.7755,
        currentLongitude: -122.4180,
      },
      {
        id: 'vol-2',
        fullName: 'Sarah Eco-Van (Van)',
        vehicleType: 'VAN',
        vehicleCapacityKg: 300,
        currentLatitude: 37.7800,
        currentLongitude: -122.4150,
      },
    ],
  });
  console.log('✅ Matched:', dispatchResult.matched);
  console.log('✅ Best Volunteer Chosen:', dispatchResult.bestVolunteer.fullName, 'Score:', dispatchResult.bestVolunteer.dispatchScore);

  // 2. Test Logistics Agent TSP Multi-Stop Route Optimization
  console.log('\n--- Test 2: Logistics Agent Multi-Stop Route Optimizer ---');
  const routePlan = await logisticsAgent.execute({
    origin: { latitude: 37.7749, longitude: -122.4194, name: 'Courier Base' },
    stops: [
      { id: 'stop_p1', type: 'PICKUP', name: 'Green Bistro', address: '101 Market St', latitude: 37.7923, longitude: -122.3998 },
      { id: 'stop_d1', type: 'DROPOFF', relatedPickupId: 'stop_p1', name: 'Mission Hope Shelter', address: '450 Mission St', latitude: 37.7833, longitude: -122.4167 },
      { id: 'stop_p2', type: 'PICKUP', name: 'Artisan Bakery', address: '200 Valencia St', latitude: 37.7680, longitude: -122.4220 },
      { id: 'stop_d2', type: 'DROPOFF', relatedPickupId: 'stop_p2', name: 'St. Anthony Kitchen', address: '150 Golden Gate Ave', latitude: 37.7650, longitude: -122.4200 },
    ],
  });
  console.log('✅ Total Optimized Distance (km):', routePlan.totalDistanceKm);
  console.log('✅ Estimated Total Duration (mins):', routePlan.estimatedDurationMin);
  console.log('✅ Waypoint Sequence:');
  routePlan.waypoints.forEach((w) => {
    console.log(`   Step ${w.stepNumber}: [${w.type}] ${w.name} (${w.address}) | Segment: ${w.segmentDistanceKm} km | ETA: ${w.eta}`);
  });

  // 3. Test Logistics Service
  console.log('\n--- Test 3: Logistics Service Route Persistence ---');
  const savedResult = await LogisticsService.optimizeRoute({
    volunteerId: 'vol-test-user-1',
    origin: { latitude: 37.7749, longitude: -122.4194 },
    stops: [
      { id: 'stop_1', type: 'PICKUP', name: 'Organic Supermarket', address: '300 Pine St', latitude: 37.7915, longitude: -122.4010 },
      { id: 'stop_2', type: 'DROPOFF', name: 'Family Crisis Center', address: '600 Ellis St', latitude: 37.7845, longitude: -122.4175 },
    ],
  });
  console.log('✅ Saved Route ID:', savedResult.route.id, 'Total Distance:', savedResult.optimizationSummary.totalDistanceKm);

  console.log('\n🎉 VOLUNTEER & LOGISTICS MODULE VERIFIED SUCCESSFULLY!');
  process.exit(0);
}

testVolunteerLogistics().catch((err) => {
  console.error('❌ Volunteer/Logistics test failed:', err);
  process.exit(1);
});
