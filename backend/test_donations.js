import { DonorService } from './src/modules/donor/donor.service.js';
import { RecipientService } from './src/modules/recipient/recipient.service.js';
import { DonationService } from './src/modules/donation/donation.service.js';

async function testDonationsFlow() {
  console.log('🧪 Testing Donor, Recipient & Donation Lifecycle Modules...');

  // 1. Get or create donor profile
  const donorProfile = await DonorService.getProfile('test-donor-user-123');
  console.log('✅ Donor Profile:', donorProfile.organizationName, 'ID:', donorProfile.id);

  // 2. Submit new donation
  const donation = await DonationService.createDonation(donorProfile.id, {
    title: '30kg Fresh Sourdough Bread & Pastries',
    description: 'Freshly baked artisanal sourdough loaves and mixed pastries baked this morning.',
    foodCategory: 'BAKERY',
    quantityValue: 30,
    quantityUnit: 'KG',
    storageTemp: 'ROOM_TEMP',
    items: [
      { name: 'Sourdough Loaves', quantity: 20, unit: 'KG' },
      { name: 'Croissants & Danishes', quantity: 10, unit: 'KG' },
    ],
  });
  console.log('✅ Donation Created:', donation.title, 'Status:', donation.status, 'Items:', donation.items.length);

  // 3. List donations
  const allDonations = await DonationService.listDonations({});
  console.log('✅ Total Donations listed:', allDonations.length);

  // 4. Update status to ANALYZED
  const updatedDonation = await DonationService.updateStatus(donation.id, 'ANALYZED');
  console.log('✅ Donation Status Transitioned to:', updatedDonation.status);

  // 5. Recipient reads available surplus donations
  const recipientProfile = await RecipientService.getProfile('test-recipient-user-456');
  const availableForRecipient = await RecipientService.getAvailableDonations(recipientProfile);
  console.log('✅ Recipient available donations count:', availableForRecipient.length);

  // 6. Donor stats
  const donorStats = await DonorService.getStats(donorProfile.id);
  console.log('✅ Donor Impact Stats:', donorStats);

  console.log('\n🎉 ALL DONOR, RECIPIENT & DONATION MODULE TESTS PASSED!');
  process.exit(0);
}

testDonationsFlow().catch((err) => {
  console.error('❌ Donation module test failed:', err);
  process.exit(1);
});
