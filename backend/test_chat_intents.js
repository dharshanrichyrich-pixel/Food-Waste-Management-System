import { ChatService } from './src/modules/chat/chat.service.js';
import { AuthService } from './src/modules/auth/auth.service.js';

async function runTests() {
  console.log('🧪 Starting Chat & Demo Auth Verification Test Suite...\n');

  // Test 1: "Find the restaurant near me"
  console.log('--- Test 1: Nearby Restaurants Intent ---');
  const res1 = await ChatService.handleMessage({
    message: 'Find the restaurant near me',
    context: { latitude: 11.0805, longitude: 76.9942, locationName: 'Saravanampatti' },
  });
  console.log('Intent:', res1.intent);
  console.log('Agent:', res1.agent);
  console.log('Reply:\n', res1.reply);
  if (!res1.reply || res1.reply.includes('AI 7-Mode') || res1.intent !== 'nearby_restaurants') {
    throw new Error('Test 1 Failed: restaurant intent not recognized or returned architecture dump');
  }
  console.log('✅ Test 1 Passed!\n');

  // Test 2: "Find an NGO near me"
  console.log('--- Test 2: NGO Shelters Intent ---');
  const res2 = await ChatService.handleMessage({
    message: 'Find an NGO near me',
    context: { latitude: 11.0168, longitude: 76.9678 },
  });
  console.log('Intent:', res2.intent);
  console.log('Reply:\n', res2.reply);
  if (!res2.reply || res2.intent !== 'nearby_ngos') {
    throw new Error('Test 2 Failed');
  }
  console.log('✅ Test 2 Passed!\n');

  // Test 3: "Show available food donations"
  console.log('--- Test 3: Available Donations Intent ---');
  const res3 = await ChatService.handleMessage({
    message: 'Show available food donations',
  });
  console.log('Intent:', res3.intent);
  console.log('Reply:\n', res3.reply);
  if (!res3.reply || res3.intent !== 'available_donations') {
    throw new Error('Test 3 Failed');
  }
  console.log('✅ Test 3 Passed!\n');

  // Test 4: "What is the shelf life of cooked pasta?"
  console.log('--- Test 4: Food Safety & Shelf Life Intent ---');
  const res4 = await ChatService.handleMessage({
    message: 'What is the shelf life of cooked pasta stored at 4C?',
  });
  console.log('Intent:', res4.intent);
  console.log('Reply:\n', res4.reply);
  if (!res4.reply.includes('3 to 4 days') || res4.intent !== 'food_safety') {
    throw new Error('Test 4 Failed');
  }
  console.log('✅ Test 4 Passed!\n');

  // Test 5: "How much food have we saved?"
  console.log('--- Test 5: Environmental Impact Intent ---');
  const res5 = await ChatService.handleMessage({
    message: 'How much food have we saved?',
  });
  console.log('Intent:', res5.intent);
  console.log('Reply:\n', res5.reply);
  if (!res5.reply || res5.intent !== 'environmental_impact') {
    throw new Error('Test 5 Failed');
  }
  console.log('✅ Test 5 Passed!\n');

  // Test 6: "Hello"
  console.log('--- Test 6: Natural Greeting ---');
  const res6 = await ChatService.handleMessage({
    message: 'Hello',
  });
  console.log('Intent:', res6.intent);
  console.log('Reply:\n', res6.reply);
  if (res6.reply.length > 300 || res6.intent !== 'greeting') {
    throw new Error('Test 6 Failed: Greeting was too long or wrong intent');
  }
  console.log('✅ Test 6 Passed!\n');

  console.log('🎉 ALL CHAT PIPELINE TESTS PASSED CLEANLY!');
  setTimeout(() => process.exit(0), 200);
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
