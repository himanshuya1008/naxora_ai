import { PrismaClient } from '@prisma/client';
import { isDevelopment } from './env.js';
import { logger } from '../utils/logger.js';

// nodemon restarts the process on every save, so a plain `new PrismaClient()`
// is fine there (fresh process = fresh client). We still guard against
// accidental double-instantiation via a module-level singleton.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: isDevelopment ? ['warn', 'error'] : ['error'],
  });

if (isDevelopment) {
  globalForPrisma.__prisma = prisma;
}

export async function connectDatabase() {
  await prisma.$connect();
  logger.info('Database connected');
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
