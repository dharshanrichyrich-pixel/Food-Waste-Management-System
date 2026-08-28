import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

let prismaInstance = null;
let isConnected = false;

export const getPrisma = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: config.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prismaInstance;
};

const withTimeout = (promise, ms = 2000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Connection timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

export const connectPostgres = async () => {
  const client = getPrisma();
  try {
    await withTimeout(client.$queryRaw`SELECT 1`, 2000);
    isConnected = true;
    console.log('[PostgreSQL] Connected successfully via Prisma.');
    return true;
  } catch (error) {
    console.warn(`[PostgreSQL] Connection Warning: ${error.message}`);
    console.warn('[PostgreSQL] Business data modules running in local dev fallback mode.');
    isConnected = false;
    return false;
  }
};

export const isPostgresAvailable = () => isConnected;

export const getPostgresStatus = async () => {
  const client = getPrisma();
  const startTime = Date.now();
  try {
    await withTimeout(client.$queryRaw`SELECT 1`, 2000);
    isConnected = true;
    const latencyMs = Date.now() - startTime;
    return {
      status: 'healthy',
      database: 'PostgreSQL (Prisma Business Layer)',
      latencyMs,
      connected: true,
    };
  } catch (error) {
    isConnected = false;
    return {
      status: 'degraded',
      database: 'PostgreSQL (Prisma Business Layer)',
      error: error.message,
      connected: false,
    };
  }
};

export const safePrisma = async (operation, fallbackFn) => {
  if (!isConnected) {
    return fallbackFn();
  }
  try {
    const client = getPrisma();
    return await withTimeout(operation(client), 2000);
  } catch (err) {
    console.warn('[safePrisma] Operation failed, falling back to in-memory store:', err.message);
    return fallbackFn();
  }
};

export const disconnectPostgres = async () => {
  if (prismaInstance) {
    try {
      await prismaInstance.$disconnect();
    } catch (e) {
      // ignore
    }
    isConnected = false;
    console.log('[PostgreSQL] Disconnected.');
  }
};

export const prisma = getPrisma();
export default prisma;
