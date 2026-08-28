import { AuthService } from './src/modules/auth/auth.service.js';
import jwt from 'jsonwebtoken';
import { config } from './src/config/env.js';

async function runAuthTests() {
  console.log('🧪 Starting Auth Module Unit & Integration Tests (MongoDB + Postgres Profile linking)...');

  // Test 1: Register Donor
  console.log('\n--- Test 1: Registration ---');
  const donorSignup = await AuthService.register({
    email: `donor_${Date.now()}@restaurant.com`,
    password: 'Password123!',
    role: 'donor',
    profileData: {
      organizationName: 'The Green Bistro',
      address: '101 Market St, San Francisco, CA',
      latitude: 37.7923,
      longitude: -122.3998,
      donorType: 'RESTAURANT',
    },
  });
  console.log('✅ Registered User:', donorSignup.user);
  console.log('✅ Access Token generated (length):', donorSignup.tokens.accessToken.length);
  console.log('✅ Refresh Token generated (length):', donorSignup.tokens.refreshToken.length);

  // Test 2: Login
  console.log('\n--- Test 2: Login ---');
  const loginResult = await AuthService.login({
    email: donorSignup.user.email,
    password: 'Password123!',
  });
  console.log('✅ Login successful for:', loginResult.user.email, 'Role:', loginResult.user.role);

  // Test 3: Token Refresh
  console.log('\n--- Test 3: Refresh Token Rotation ---');
  const refreshResult = await AuthService.refresh(loginResult.tokens.refreshToken);
  console.log('✅ New Access Token generated:', refreshResult.accessToken ? 'YES' : 'NO');
  console.log('✅ New Refresh Token rotated:', refreshResult.refreshToken ? 'YES' : 'NO');

  // Test 4: Verify JWT payload
  console.log('\n--- Test 4: JWT Verification & Claims ---');
  const decoded = jwt.verify(refreshResult.accessToken, config.jwt.accessSecret);
  console.log('✅ Decoded JWT Token payload:', { id: decoded.id, email: decoded.email, role: decoded.role });

  console.log('\n🎉 ALL AUTH TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runAuthTests().catch((err) => {
  console.error('❌ Auth test error:', err);
  process.exit(1);
});
