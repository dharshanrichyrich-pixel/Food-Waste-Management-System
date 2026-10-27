import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

// Disable operation buffering so queries do not hang for 10s when MongoDB is offline
mongoose.set('bufferCommands', false);

export const connectMongoDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      dbName: 'food_waste_auth',
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 15000,
      connectTimeoutMS: 5000,
      maxPoolSize: 25,
      minPoolSize: 2,
      autoIndex: false,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Connection Warning: ${error.message}.`);
    console.warn(`[MongoDB] Auth endpoints will report connection state if MongoDB is not running.`);
    isConnected = false;
    return null;
  }
};

export const getMongoStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    status: state === 1 ? 'healthy' : 'degraded',
    state: states[state] || 'unknown',
    database: 'MongoDB (Mongoose Auth)',
    host: mongoose.connection.host || 'unknown',
    name: mongoose.connection.name || 'food_waste_auth',
  };
};

export const disconnectMongoDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Disconnected.');
  }
};
