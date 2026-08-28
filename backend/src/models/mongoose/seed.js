import mongoose from 'mongoose';
import {
  User,
  DonorProfile,
  RecipientProfile,
  VolunteerProfile,
  Donation,
  Match,
  Delivery,
  Route,
  Notification,
  ImpactMetric,
} from './index.js';

/**
 * Seed Coimbatore & Saravanampatti Live Demonstration Records in MongoDB
 * Role mappings:
 * - Admin: Dharshan
 * - Volunteer: Kumaran
 * - Donor: Deedarsh (The Green Bistro)
 * - NGO Recipient / Owner: Jersin (Peelamedu NGO Shelter)
 */
export async function seedMongoDbIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[MongoDB Seeder] Database contains ${userCount} users. Ensuring Dharshan, Kumaran, Deedarsh, and Jersin are configured...`);
    }

    const defaultPasswordHash = await User.hashPassword('dharshan2006');

    // 1. Volunteer User: Kumaran
    let kumaranUser = await User.findOne({ email: 'kumaran@foodflow.org' });
    if (!kumaranUser) {
      kumaranUser = await User.create({
        email: 'kumaran@foodflow.org',
        passwordHash: defaultPasswordHash,
        role: 'volunteer',
        isVerified: true,
      });
      console.log('[MongoDB Seeder] Created volunteer user: kumaran@foodflow.org');
    }

    let kumaranProfile = await VolunteerProfile.findOne({ userId: kumaranUser._id });
    if (!kumaranProfile) {
      kumaranProfile = await VolunteerProfile.create({
        userId: kumaranUser._id,
        fullName: 'Kumaran',
        contactPhone: '+91 98765 43210',
        vehicleType: 'CAR',
        vehicleCapacityKg: 75.0,
        isAvailable: true,
        currentLatitude: 11.0168, // Gandhipuram, Coimbatore
        currentLongitude: 76.9678,
        activeHours: '8:00 AM - 9:00 PM',
      });
    } else {
      kumaranProfile.fullName = 'Kumaran';
      await kumaranProfile.save();
    }

    // 2. Donor User: Deedarsh (The Green Bistro, Saravanampatti)
    let deedarshUser = await User.findOne({ email: 'deedarsh@greenbistro.com' });
    if (!deedarshUser) {
      deedarshUser = await User.create({
        email: 'deedarsh@greenbistro.com',
        passwordHash: defaultPasswordHash,
        role: 'donor',
        isVerified: true,
      });
    }

    let deedarshProfile = await DonorProfile.findOne({ userId: deedarshUser._id });
    if (!deedarshProfile) {
      deedarshProfile = await DonorProfile.create({
        userId: deedarshUser._id,
        organizationName: 'Deedarsh (The Green Bistro)',
        contactPhone: '+91 98200 11223',
        address: 'Sathy Road, Saravanampatti, Coimbatore, Tamil Nadu 641035',
        latitude: 11.0805, // Saravanampatti
        longitude: 76.9942,
        donorType: 'RESTAURANT',
      });
      console.log('[MongoDB Seeder] Created donor: Deedarsh (The Green Bistro)');
    } else {
      deedarshProfile.organizationName = 'Deedarsh (The Green Bistro)';
      await deedarshProfile.save();
    }

    // 3. Recipient NGO User: Jersin (Peelamedu NGO Shelter)
    let jersinUser = await User.findOne({ email: 'jersin@peelamedu.org' });
    if (!jersinUser) {
      jersinUser = await User.create({
        email: 'jersin@peelamedu.org',
        passwordHash: defaultPasswordHash,
        role: 'recipient',
        isVerified: true,
      });
    }

    let jersinProfile = await RecipientProfile.findOne({ userId: jersinUser._id });
    if (!jersinProfile) {
      jersinProfile = await RecipientProfile.create({
        userId: jersinUser._id,
        organizationName: 'Jersin (Peelamedu NGO Shelter)',
        contactPhone: '+91 98400 44556',
        address: 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004',
        latitude: 11.0267, // Peelamedu
        longitude: 77.0055,
        recipientType: 'SHELTER',
        capacityMealsPerDay: 250,
      });
      console.log('[MongoDB Seeder] Created recipient NGO: Jersin (Peelamedu NGO Shelter)');
    } else {
      jersinProfile.organizationName = 'Jersin (Peelamedu NGO Shelter)';
      await jersinProfile.save();
    }

    // 4. Admin User: Dharshan
    let dharshanAdminUser = await User.findOne({ email: 'dharshanrichyrich@gmail.com' });
    if (!dharshanAdminUser) {
      dharshanAdminUser = await User.create({
        email: 'dharshanrichyrich@gmail.com',
        passwordHash: defaultPasswordHash,
        role: 'admin',
        isVerified: true,
      });
      console.log('[MongoDB Seeder] Created admin user: dharshanrichyrich@gmail.com (Dharshan)');
    }

    let dharshanOrgUser = await User.findOne({ email: 'dharshan@foodflow.org' });
    if (!dharshanOrgUser) {
      dharshanOrgUser = await User.create({
        email: 'dharshan@foodflow.org',
        passwordHash: defaultPasswordHash,
        role: 'admin',
        isVerified: true,
      });
    }

    // 5. Active Live Demonstration Donation: Deedarsh -> Jersin (Couriered by Kumaran)
    let sampleDonation = await Donation.findOne({ title: '40kg Prepared Hot Lunch Platters (Cooked Meals)' });
    if (!sampleDonation) {
      sampleDonation = await Donation.create({
        donorId: deedarshProfile._id,
        title: '40kg Prepared Hot Lunch Platters (Cooked Meals)',
        description: 'Fresh prepared hygienic lunch platters with cooked rice, sambar, and vegetable curries.',
        foodCategory: 'COOKED_MEALS',
        quantityValue: 40,
        quantityUnit: 'KG',
        storageTemp: 'REFRIGERATED',
        status: 'MATCHED',
        freshness: {
          freshnessScore: 96,
          spoilageRisk: 'LOW',
          safetyWindowHours: 4,
          confidence: 0.98,
          recommendation: 'Safe for immediate distribution. Direct transport recommended.',
          evaluatedAt: new Date(),
        },
        items: [
          { name: 'Prepared Lunch Platters', quantity: 25, unit: 'KG' },
          { name: 'Fresh Salad & Fruit Bowls', quantity: 15, unit: 'KG' },
        ],
        imageUrls: [
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
        ],
      });
      console.log('[MongoDB Seeder] Created sample donation: 40kg Prepared Lunch Platters');
    }

    // 6. Match Proposal: Deedarsh to Jersin
    let sampleMatch = await Match.findOne({ donationId: sampleDonation._id });
    if (!sampleMatch) {
      sampleMatch = await Match.create({
        donationId: sampleDonation._id,
        recipientId: jersinProfile._id,
        score: 95.5,
        status: 'ACCEPTED',
        distanceKm: 6.2,
        estimatedTransitMinutes: 18,
      });
      console.log('[MongoDB Seeder] Created match between Deedarsh and Jersin');
    }

    // 7. Active Courier Dispatch: Assigned to Kumaran
    let sampleDelivery = await Delivery.findOne({ matchId: sampleMatch._id });
    if (!sampleDelivery) {
      sampleDelivery = await Delivery.create({
        matchId: sampleMatch._id,
        donationId: sampleDonation._id,
        volunteerId: kumaranProfile._id,
        status: 'EN_ROUTE_PICKUP',
        pickupAddress: 'The Green Bistro, Sathy Road, Saravanampatti, Coimbatore',
        dropoffAddress: 'Peelamedu NGO Shelter, Avinashi Road, Coimbatore',
        estimatedDurationMinutes: 18,
        actualDistanceKm: 6.2,
      });
      console.log('[MongoDB Seeder] Created delivery assignment for Kumaran');
    }

    // 8. Global Impact Metrics
    const impactCount = await ImpactMetric.countDocuments();
    if (impactCount === 0) {
      await ImpactMetric.create({
        totalRescuedMeals: 4820,
        totalCo2AvoidedKg: 5460.5,
        totalWaterSavedLiters: 634000,
        totalPeopleFed: 3950,
        totalDonationsCount: 142,
        completedDeliveriesCount: 128,
      });
      console.log('[MongoDB Seeder] Seeded global impact metrics');
    }

    console.log('[MongoDB Seeder] Database seeded with Dharshan (Admin), Kumaran (Volunteer), Deedarsh (Donor), and Jersin (Recipient).');
  } catch (error) {
    console.error('[MongoDB Seeder] Seeding error:', error.message);
  }
}
