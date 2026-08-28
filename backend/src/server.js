import http from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { connectMongoDB, disconnectMongoDB } from './config/mongodb.js';
import { seedMongoDbIfEmpty } from './models/mongoose/seed.js';
import { initWebSocket } from './websocket/socket.js';

const httpServer = http.createServer(app);

// Initialize WebSockets
initWebSocket(httpServer);

const startServer = async () => {
  console.log('----------------------------------------------------');
  console.log('🌱 Starting FoodFlow Pure MongoDB Backend Service...');
  console.log('----------------------------------------------------');

  // Connect MongoDB
  const conn = await connectMongoDB();
  if (conn) {
    // Seed verified demo records if empty
    await seedMongoDbIfEmpty();
  }

  httpServer.listen(config.port, () => {
    console.log(`🚀 Server listening on port ${config.port} in [${config.nodeEnv}] mode`);
    console.log(`📡 Health Check URL: http://localhost:${config.port}/health`);
    console.log(`🔌 WebSocket Server active on port ${config.port}`);
    console.log('----------------------------------------------------');
  });
};

// Graceful Shutdown
const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  await disconnectMongoDB();
  httpServer.close(() => {
    console.log('[Server] HTTP server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer().catch((error) => {
  console.error('[Server Fatal Error]:', error);
  process.exit(1);
});
