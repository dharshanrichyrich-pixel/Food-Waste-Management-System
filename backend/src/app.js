import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { getMongoStatus } from './config/mongodb.js';
import { sendSuccess } from './utils/response.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import authRouter from './modules/auth/auth.routes.js';
import donorRouter from './modules/donor/donor.routes.js';
import recipientRouter from './modules/recipient/recipient.routes.js';
import donationRouter from './modules/donation/donation.routes.js';
import matchingRouter from './modules/matching/matching.routes.js';
import volunteerRouter from './modules/volunteer/volunteer.routes.js';
import logisticsRouter from './modules/logistics/logistics.routes.js';
import notificationRouter from './modules/notification/notification.routes.js';
import deliveryRouter from './modules/delivery/delivery.routes.js';
import analyticsRouter from './modules/analytics/analytics.routes.js';
import adminRouter from './modules/admin/admin.routes.js';
import jobsRouter from './modules/jobs/jobs.routes.js';
import chatRouter from './modules/chat/chat.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and utility middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        config.clientUrl,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ];
      // Allow all Vercel domains (production + preview deployments)
      if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Root Endpoint (Friendly Browser Status Page & JSON API Welcome)
app.get('/', (req, res) => {
  const acceptsHtml = req.accepts(['html', 'json']) === 'html';
  if (acceptsHtml) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FoodFlow Backend API — Online</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }
          body { background-color: #F8FAFC; color: #0F172A; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }
          .card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 24px; padding: 40px; max-width: 620px; width: 100%; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); text-align: center; }
          .badge { display: inline-flex; align-items: center; gap: 8px; background: #ECFDF5; border: 1px solid #A7F3D0; color: #047857; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 6px 14px; rounded-full; border-radius: 9999px; margin-bottom: 20px; }
          .dot { width: 8px; height: 8px; background: #10B981; border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
          h1 { font-size: 28px; font-weight: 800; color: #0F172A; margin-bottom: 10px; }
          p { font-size: 14px; color: #64748B; line-height: 1.6; margin-bottom: 24px; }
          .btn-group { display: flex; flex-direction: column; gap: 12px; }
          .btn-primary { display: inline-flex; align-items: center; justify-content: center; background: #059669; color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 14px; transition: background 0.2s; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25); }
          .btn-primary:hover { background: #047857; }
          .btn-secondary { display: inline-flex; align-items: center; justify-content: center; background: #F1F5F9; color: #334155; text-decoration: none; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 12px; border: 1px solid #E2E8F0; }
          .btn-secondary:hover { background: #E2E8F0; }
          .endpoints { margin-top: 28px; padding-top: 20px; border-top: 1px solid #F1F5F9; text-align: left; }
          .endpoints h4 { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94A3B8; letter-spacing: 0.05em; margin-bottom: 12px; }
          .endpoints ul { list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
          .endpoints a { color: #059669; text-decoration: none; font-weight: 600; font-family: monospace; }
          .endpoints a:hover { text-decoration: underline; }
          @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.1); } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">
            <span class="dot"></span>
            MongoDB Atlas Connected &bull; Port 5000
          </div>
          <h1>FoodFlow Backend API</h1>
          <p>
            The backend REST server and AI Agent Swarm are online and operating normally. To view the user interface, open the frontend web app.
          </p>
          <div class="btn-group">
            <a href="http://localhost:5173" class="btn-primary">
              Launch FoodFlow Web App &rarr;
            </a>
            <a href="/api/v1" class="btn-secondary">
              View API v1 Manifest (JSON)
            </a>
          </div>
          <div class="endpoints">
            <h4>Quick Endpoints</h4>
            <ul>
              <li>&bull; <a href="/health">/health</a> &mdash; Database Health & Uptime Status</li>
              <li>&bull; <a href="/api/v1">/api/v1</a> &mdash; API Module Catalog</li>
              <li>&bull; <a href="http://localhost:5173">http://localhost:5173</a> &mdash; Frontend Dashboard</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  return sendSuccess(res, {
    name: 'FoodFlow Pure MongoDB Backend API',
    status: 'ONLINE',
    port: config.port,
    frontendUrl: config.clientUrl || 'http://localhost:5173',
    database: 'MongoDB Atlas (food_waste_auth)',
    apiBase: '/api/v1',
    health: '/health',
  }, 'FoodFlow Backend API is running');
});

// Serve uploaded static assets
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check Endpoint (Validates MongoDB Atlas Health)
app.get('/health', async (req, res) => {
  const mongoStatus = getMongoStatus();
  const isHealthy = mongoStatus.status === 'healthy';
  const overallStatus = isHealthy ? 'healthy' : 'degraded';

  const healthData = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: 'MongoDB (Mongoose Unified Database)',
    services: {
      mongodb: mongoStatus,
    },
    version: '3.0.0-pure-mongo',
    environment: config.nodeEnv,
  };

  return sendSuccess(res, healthData, `System health status: ${overallStatus}`, isHealthy ? 200 : 503);
});

// API Root Index
app.get('/api/v1', (req, res) => {
  return sendSuccess(
    res,
    {
      name: 'FoodFlow Pure MongoDB Backend API',
      version: '3.0.0',
      database: 'MongoDB (food_waste_auth)',
      modules: [
        'auth (MongoDB User & JWT)',
        'donor (MongoDB DonorProfile)',
        'recipient (MongoDB RecipientProfile)',
        'donation (MongoDB Donation & Items)',
        'matches (MongoDB Match & AI Agents)',
        'volunteers (MongoDB VolunteerProfile)',
        'logistics (MongoDB Route & LogisticsAgent)',
        'notifications (MongoDB Notification)',
        'deliveries (MongoDB Delivery)',
        'analytics (MongoDB ImpactMetric & Aggregations)',
        'admin (MongoDB System Telemetry)',
        'jobs (MongoDB AgentJobLog)',
        'chat (Autonomous AI Swarm Chatbot)',
      ],
    },
    'API v1 is active on pure MongoDB'
  );
});

// Mounted Modules
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/donors', donorRouter);
app.use('/api/v1/recipients', recipientRouter);
app.use('/api/v1/donations', donationRouter);
app.use('/api/v1/matches', matchingRouter);
app.use('/api/v1/volunteers', volunteerRouter);
app.use('/api/v1/logistics', logisticsRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/deliveries', deliveryRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/chat', chatRouter);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
