import { orchestrator, BaseAgent } from './src/agents/orchestrator.js';

class MockAgent extends BaseAgent {
  constructor() {
    super('MockAgent', '1.0.0');
  }

  async execute(payload) {
    console.log(`[MockAgent] Executing with input:`, payload);
    // Simulate AI inference calculation
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      status: 'PROCESSED',
      score: 95.5,
      timestamp: new Date().toISOString(),
    };
  }
}

async function testOrchestrator() {
  console.log('🧪 Testing Agent Orchestrator & Job Queue Engine...');

  const mockAgent = new MockAgent();
  orchestrator.registerAgent('MockAgent', mockAgent);

  // 1. Test Direct Execution
  console.log('\n--- Test 1: Direct Synchronous Execution ---');
  const directResult = await orchestrator.executeDirect('MockAgent', { sampleData: 'direct-test-123' });
  console.log('✅ Direct Execution Succeeded:', directResult);

  // 2. Test Async Dispatch & Queuing
  console.log('\n--- Test 2: Async Job Dispatch ---');
  const jobId = await orchestrator.dispatch('MockAgent', { sampleData: 'async-job-456' }, { priority: 'HIGH' });
  console.log('✅ Job Dispatched with JobID:', jobId);

  // Wait for worker loop
  await new Promise((resolve) => setTimeout(resolve, 150));

  const jobStatus = await orchestrator.getJobStatus(jobId);
  console.log('✅ Polled Job Status:', jobStatus.status, 'Result:', jobStatus.result);

  console.log('\n🎉 AGENT ORCHESTRATOR MODULE VERIFIED SUCCESSFULLY!');
  process.exit(0);
}

testOrchestrator().catch((err) => {
  console.error('❌ Orchestrator test failed:', err);
  process.exit(1);
});
