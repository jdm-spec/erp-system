import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export async function checkDatabaseConnection(timeoutMs = 1500): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DB connection check timed out')), timeoutMs)
    );
    await Promise.race([prisma.$queryRaw`SELECT 1`, timeoutPromise]);
    return true;
  } catch (error) {
    return false;
  }
}

