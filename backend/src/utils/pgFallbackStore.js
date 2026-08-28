import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory fallback repository for local offline development
 * Mirroring Prisma PostgreSQL schema models
 */
class InMemoryDb {
  constructor() {
    this.donorProfiles = new Map();
    this.recipientProfiles = new Map();
    this.volunteerProfiles = new Map();
    this.donations = new Map();
    this.donationItems = new Map();
    this.freshnessAssessments = new Map();
    this.matches = new Map();
    this.deliveries = new Map();
    this.routes = new Map();
    this.notifications = new Map();
    this.impactMetrics = new Map();
    this.agentJobLogs = new Map();

    this.seedInitialData();
  }

  seedInitialData() {
    // Seed Sample Donor
    const donorId = 'donor-sample-01';
    this.donorProfiles.set(donorId, {
      id: donorId,
      userId: '6a8c21d6279c067de31dadac',
      organizationName: 'Grand Hyatt Executive Kitchen',
      contactPhone: '+1 (415) 555-0192',
      address: '345 Stockton St, San Francisco, CA 94108',
      latitude: 37.7892,
      longitude: -122.4068,
      donorType: 'RESTAURANT',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Sample Recipient
    const recipientId = 'recipient-sample-01';
    this.recipientProfiles.set(recipientId, {
      id: recipientId,
      userId: '6a8c21d6279c067de31dadad',
      organizationName: 'St. Anthony Dining Room & Shelter',
      recipientType: 'SHELTER',
      contactPhone: '+1 (415) 555-8833',
      address: '121 Golden Gate Ave, San Francisco, CA 94102',
      latitude: 37.7825,
      longitude: -122.4132,
      capacityMealsPerDay: 300,
      dietaryPreferences: ['HALAL', 'VEGETARIAN', 'GLUTEN_FREE'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Sample Volunteer
    const volunteerId = 'volunteer-sample-01';
    this.volunteerProfiles.set(volunteerId, {
      id: volunteerId,
      userId: '6a8c21d6279c067de31dadae',
      fullName: 'Maya Lin (Eco Courier)',
      contactPhone: '+1 (415) 555-4421',
      vehicleType: 'ELECTRIC_VAN',
      vehicleCapacityKg: 150.0,
      isAvailable: true,
      currentLatitude: 37.7850,
      currentLongitude: -122.4100,
      activeHours: '08:00 - 20:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Sample Donation
    const donationId = 'donation-sample-01';
    this.donations.set(donationId, {
      id: donationId,
      donorId,
      title: '50 Fresh Bento Box Meals (Prepared 2 hours ago)',
      description: 'Gourmet roasted chicken, jasmine rice, and seasonal steamed greens packed in insulated thermal boxes.',
      foodCategory: 'COOKED_MEALS',
      quantityValue: 25.0,
      quantityUnit: 'KG',
      preparedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      expiryEstimatedAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      storageTemp: 'WARM',
      status: 'MATCH_PROPOSED',
      imageUrls: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'],
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      updatedAt: new Date(),
    });

    this.freshnessAssessments.set('fresh-sample-01', {
      id: 'fresh-sample-01',
      donationId,
      freshnessScore: 94.5,
      safetyWindowHours: 4.5,
      confidenceScore: 0.96,
      visualDefectFlags: ['safe_thermal_seal', 'no_visual_defects'],
      recommendation: 'SAFE_FOR_DONATION',
      modelVersion: 'food-vision-v2.1',
      createdAt: new Date(),
    });
  }
}

export const inMemoryDb = new InMemoryDb();
