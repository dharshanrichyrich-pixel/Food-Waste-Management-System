import express from 'express';
import { sendSuccess, sendError } from '../../utils/response.js';
import agentOrchestrator from '../../agents/orchestrator.js';

const router = express.Router();

/**
 * Handle AI Agent Swarm Chat Queries
 * POST /api/v1/chat/message
 */
router.post('/message', async (req, res, next) => {
  try {
    const { message, context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return sendError(res, 'A valid message string is required', 400);
    }

    const lower = message.toLowerCase().trim();

    // 1. Freshness / Food Safety queries (FoodAgent)
    if (lower.includes('fresh') || lower.includes('shelf') || lower.includes('spoil') || lower.includes('temp') || lower.includes('safety') || lower.includes('cooked')) {
      const simulatedEvaluation = await agentOrchestrator.runAgent('FoodAgent', {
        foodCategory: lower.includes('bakery') ? 'BAKERY' : lower.includes('produce') ? 'PRODUCE' : 'COOKED_MEALS',
        storageTemp: lower.includes('warm') ? 'WARM' : lower.includes('frozen') ? 'FROZEN' : 'REFRIGERATED',
        preparationTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      });

      return sendSuccess(res, {
        reply: `🧪 **FoodAgent Analysis Complete:**\n\n- **Safety Score:** ${simulatedEvaluation.freshnessScore}/100\n- **Safe Window:** ${simulatedEvaluation.safetyWindowHours} hours remaining\n- **Storage Standard:** Maintain holding at 2°C - 4°C for cooked meals.\n- **Recommendation:** ${simulatedEvaluation.recommendation}. Immediate dispatch recommended to maximize nutritional quality.`,
        agent: 'FoodAgent',
        quickActions: [
          'Post this batch to Donor Portal',
          'Check nearest NGO capacity',
          'Calculate CO2 savings'
        ],
        data: simulatedEvaluation,
      }, 'FoodAgent query processed');
    }

    // 2. Matching / NGO queries (MatchingAgent)
    if (lower.includes('match') || lower.includes('ngo') || lower.includes('shelter') || lower.includes('recipient') || lower.includes('claim')) {
      const matchResult = await agentOrchestrator.runAgent('MatchingAgent', {
        donation: {
          id: 'demo-donation',
          foodCategory: 'COOKED_MEALS',
          quantityValue: 35,
          quantityUnit: 'KG',
          donor: { latitude: 19.0657, longitude: 72.8687 },
        },
        recipients: [
          { id: 'rec-1', organizationName: 'St. Jude Community Shelter', capacityMealsPerDay: 250, distanceKm: 1.2 },
          { id: 'rec-2', organizationName: 'Hope Haven Kitchen', capacityMealsPerDay: 180, distanceKm: 2.8 },
        ]
      });

      return sendSuccess(res, {
        reply: `🤝 **MatchingAgent Recommendation:**\n\nFound **2 accredited NGO shelters** within 3 km:\n\n1. **St. Jude Community Shelter** (1.2 km away) — Match Score: **96.4%** (Can absorb 70 meals today)\n2. **Hope Haven Kitchen** (2.8 km away) — Match Score: **88.1%**\n\nWould you like me to auto-reserve this allocation?`,
        agent: 'MatchingAgent',
        quickActions: [
          'Claim allocation for St. Jude',
          'Assign nearest courier',
          'View interactive map route'
        ],
        data: matchResult,
      }, 'MatchingAgent query processed');
    }

    // 3. Courier / Volunteer / Route queries (VolunteerAgent & LogisticsAgent)
    if (lower.includes('courier') || lower.includes('driver') || lower.includes('route') || lower.includes('transit') || lower.includes('eta') || lower.includes('pickup') || lower.includes('deliver')) {
      const logisticsResult = await agentOrchestrator.runAgent('LogisticsAgent', {
        pickup: { name: 'Grand Heritage Hotel', address: 'BKC, Mumbai' },
        dropoff: { name: 'St. Jude Shelter', address: 'Dharavi, Mumbai' },
      });

      return sendSuccess(res, {
        reply: `🚚 **LogisticsAgent Dispatch Plan:**\n\n- **Assigned Courier:** Alex Rivera (Cold-Chain Car Fleet)\n- **Estimated Transit Distance:** 4.2 km\n- **Estimated Total ETA:** 14 mins\n- **Optimal Route:** BKC Main Ave → Western Express Hwy → Dharavi 90ft Rd.\n- **Status:** Courier en route to pickup.`,
        agent: 'LogisticsAgent',
        quickActions: [
          'Track live courier on GPS',
          'Call shelter point-of-contact',
          'Generate delivery handover token'
        ],
        data: logisticsResult,
      }, 'LogisticsAgent query processed');
    }

    // 4. Impact / Environmental savings queries (ImpactAgent)
    if (lower.includes('impact') || lower.includes('co2') || lower.includes('carbon') || lower.includes('water') || lower.includes('people') || lower.includes('stats')) {
      const impactResult = await agentOrchestrator.runAgent('ImpactAgent', {
        quantityKg: 50,
      });

      return sendSuccess(res, {
        reply: `🌿 **ImpactAgent Environmental Audit:**\n\nFor a **50 kg** surplus food batch redistributed:\n\n- 🍽️ **Meals Rescued:** 110 portions\n- 🌍 **GHG Emissions Avoided:** 125.0 kg CO₂e\n- 💧 **Agricultural Water Conserved:** 14,500 Liters\n- 👥 **Estimated People Nourished:** 90 individuals\n\nThis equates to removing ~275 car-miles from the road!`,
        agent: 'ImpactAgent',
        quickActions: [
          'Download Impact Certificate',
          'View Admin Telemetry Logs',
          'Explore Central Dashboard'
        ],
        data: impactResult,
      }, 'ImpactAgent query processed');
    }

    // 5. Default General Assistant Response
    return sendSuccess(res, {
      reply: `🤖 **FoodFlow Autonomous AI Network:**\n\nI am your unified Agent Swarm assistant connecting:\n- 🧪 **FoodAgent** — Automated shelf life & freshness grading\n- 🤝 **MatchingAgent** — Constraint-aware shelter matching\n- 🚚 **Volunteer & Logistics Agent** — Real-time TSP route dispatch\n- 🌿 **ImpactAgent** — EPA-aligned carbon and water metrics\n\nTry asking me:\n- *"What is the shelf life of cooked pasta stored at 4°C?"*\n- *"Show me nearest shelters with available capacity"*\n- *"What is the ETA for delivery #FF-4891?"*\n- *"How much CO2 is saved by diverting 100kg of food?"*`,
      agent: 'AgentOrchestrator',
      quickActions: [
        'Check Food Freshness',
        'Find Shelter Matches',
        'Track Delivery Courier',
        'View Environmental Impact'
      ]
    }, 'General assistant response generated');

  } catch (error) {
    next(error);
  }
});

export default router;
