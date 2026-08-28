import { config } from './env.js';

let isConnected = false;

export const getPrisma = () => null;

export const connectPostgres = async () => {
  isConnected = false;
  return false;
};

export const isPostgresAvailable = () => false;

export const getPostgresStatus = async () => {
  return {
    status: 'degraded',
    database: 'PostgreSQL (Disabled - MongoDB Single DB Mode)',
    connected: false,
    latencyMs: 0,
  };
};

export const safePrisma = async (operation, fallbackFn) => {
  // Always run fallback in MongoDB Single Database mode
  return fallbackFn();
};

export const disconnectPostgres = async () => {
  isConnected = false;
};

export const prisma = null;
export default prisma;
