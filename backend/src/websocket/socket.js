import { Server as SocketIOServer } from 'socket.io';
import { config } from '../config/env.js';

let io = null;

export const initWebSocket = (httpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Join user-specific room for private alerts
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[WebSocket] Socket ${socket.id} joined room user:${userId}`);
      }
    });

    // Join role-specific channel (e.g. 'donor', 'recipient', 'volunteer', 'admin')
    socket.on('join:role', (role) => {
      if (role) {
        socket.join(`role:${role}`);
        console.log(`[WebSocket] Socket ${socket.id} joined room role:${role}`);
      }
    });

    // Join live delivery tracking room
    socket.on('join:delivery', (deliveryId) => {
      if (deliveryId) {
        socket.join(`delivery:${deliveryId}`);
        console.log(`[WebSocket] Socket ${socket.id} joined room delivery:${deliveryId}`);
      }
    });

    // Volunteer broadcasting live GPS coordinates
    socket.on('volunteer:location_update', ({ deliveryId, latitude, longitude, speed, heading }) => {
      if (deliveryId) {
        io.to(`delivery:${deliveryId}`).emit('delivery:location_stream', {
          deliveryId,
          latitude,
          longitude,
          speed,
          heading,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('WebSocket server has not been initialized');
  }
  return io;
};

export const emitToUser = (userId, event, payload) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, payload);
  }
};

export const emitToRole = (role, event, payload) => {
  if (io && role) {
    io.to(`role:${role}`).emit(event, payload);
  }
};

export const emitDeliveryUpdate = (deliveryId, event, payload) => {
  if (io && deliveryId) {
    io.to(`delivery:${deliveryId}`).emit(event, payload);
  }
};

export const emitAgentJobUpdate = (jobId, data) => {
  if (io) {
    io.emit('agent:job_update', { jobId, ...data });
  }
};
