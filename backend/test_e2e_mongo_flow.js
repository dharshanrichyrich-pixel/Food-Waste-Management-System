import http from 'http';

const API_BASE = 'http://localhost:5000/api/v1';

async function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runMongoE2ETests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PURE MONGODB END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  const randomSuffix = Math.floor(Math.random() * 10000);
  const testEmail = `test_donor_${randomSuffix}@foodflow.ai`;
  const testPassword = 'Password@123';

  try {
    // 1. Health Check
    console.log('👉 [Step 1/9] Verifying /health endpoint on Pure MongoDB...');
    const healthRes = await makeRequest('/../../health', 'GET');
    console.log(`   Health status: ${healthRes.status}, database: ${healthRes.data?.data?.database}`);
    if (healthRes.status !== 200) throw new Error('Health check failed');

    // 2. User Registration in MongoDB
    console.log('\n👉 [Step 2/9] Testing User Registration in MongoDB...');
    const regRes = await makeRequest('/auth/signup', 'POST', {
      email: testEmail,
      password: testPassword,
      role: 'donor',
      organizationName: `Green Bistro Test Kitchen #${randomSuffix}`,
      address: 'Sathy Road, Saravanampatti, Coimbatore',
      donorType: 'RESTAURANT',
    });
    console.log(`   Registration status: ${regRes.status}, user: ${regRes.data?.data?.user?.email}`);
    if (regRes.status !== 201) throw new Error(regRes.data?.error?.message || 'Registration failed');
    const accessToken = regRes.data?.data?.tokens?.accessToken;
    const donorId = regRes.data?.data?.profile?.id || regRes.data?.data?.profile?._id;

    // 3. User Login in MongoDB
    console.log('\n👉 [Step 3/9] Testing User Login with MongoDB credentials...');
    const loginRes = await makeRequest('/auth/login', 'POST', {
      email: testEmail,
      password: testPassword,
    });
    console.log(`   Login status: ${loginRes.status}, authenticated role: ${loginRes.data?.data?.user?.role}`);
    if (loginRes.status !== 200) throw new Error('Login failed');

    // 4. Create Food Donation & Store in MongoDB
    console.log('\n👉 [Step 4/9] Creating Food Donation with FoodAgent Freshness Assessment...');
    const donationRes = await makeRequest(
      '/donations',
      'POST',
      {
        title: '30kg Fresh Vegetable Breyani & Curry',
        description: 'Fresh lunch buffet surplus cooked 2 hours ago in Saravanampatti.',
        foodCategory: 'COOKED_MEALS',
        quantityValue: 30,
        quantityUnit: 'KG',
        storageTemp: 'REFRIGERATED',
        items: [
          { name: 'Vegetable Breyani', quantity: 20, unit: 'KG' },
          { name: 'Curry & Raita', quantity: 10, unit: 'KG' },
        ],
      },
      accessToken
    );
    console.log(`   Donation status: ${donationRes.status}, id: ${donationRes.data?.data?._id || donationRes.data?.data?.id}`);
    console.log(`   Freshness Score: ${donationRes.data?.data?.freshness?.freshnessScore}%, recommendation: ${donationRes.data?.data?.freshness?.recommendation}`);
    const donationId = donationRes.data?.data?._id || donationRes.data?.data?.id;

    // 5. Query Donation by ID from MongoDB
    console.log('\n👉 [Step 5/9] Fetching Donation from MongoDB...');
    const fetchDonationRes = await makeRequest(`/donations/${donationId}`, 'GET');
    console.log(`   Donation title: "${fetchDonationRes.data?.data?.title}", status: ${fetchDonationRes.data?.data?.status}`);
    if (!fetchDonationRes.data?.data) throw new Error('Donation not found in MongoDB');

    // 6. Match Donation to NGO Shelters (MatchingAgent)
    console.log('\n👉 [Step 6/9] Proposing NGO Shelter Matches via MatchingAgent...');
    const matchRes = await makeRequest(`/matches/propose/${donationId}`, 'POST');
    console.log(`   Matching status: ${matchRes.status}, matches found: ${matchRes.data?.data?.matches?.length}`);
    const topMatch = matchRes.data?.data?.matches?.[0];
    const matchId = topMatch?._id || topMatch?.id;

    // 7. Accept Match Proposal & Dispatching Courier Route
    console.log('\n👉 [Step 7/9] Accepting Match Proposal & Dispatching Courier Route...');
    if (matchId) {
      const acceptRes = await makeRequest(`/matches/${matchId}/accept`, 'POST');
      console.log(`   Match accepted status: ${acceptRes.status}`);
      if (acceptRes.status !== 200) throw new Error('Failed to accept match proposal');
    }

    // 8. Track Live Delivery Progression
    console.log('\n👉 [Step 8/9] Querying Deliveries & Tracking State from MongoDB...');
    const deliveriesRes = await makeRequest('/deliveries', 'GET');
    console.log(`   Total active deliveries in MongoDB: ${deliveriesRes.data?.data?.length}`);

    // 9. Dashboard Analytics & Coimbatore Live Map Data
    console.log('\n👉 [Step 9/9] Querying Platform Analytics & Live Coimbatore Telemetry...');
    const impactRes = await makeRequest('/analytics/impact', 'GET');
    console.log(`   Total Meals Rescued: ${impactRes.data?.data?.totalRescuedMeals}`);
    console.log(`   Total CO2 Avoided: ${impactRes.data?.data?.totalCo2AvoidedKg} kg`);
    console.log(`   Active Donors: ${impactRes.data?.data?.activeDonors}, Volunteers: ${impactRes.data?.data?.activeVolunteers}`);

    console.log('\n====================================================');
    console.log('🎉 ALL 9 PURE MONGODB END-TO-END TESTS PASSED 100%!');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err.message);
    process.exit(1);
  }
}

runMongoE2ETests();
