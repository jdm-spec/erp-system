import { Redis } from 'ioredis';
import { env } from './env.js';

let redisInstance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          return null; // Stop retrying after 5 attempts
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisInstance.on('error', (err) => {
      console.warn('⚠️ Redis connection warning:', err.message);
    });
  }
  return redisInstance;
}

export async function checkRedisConnection(timeoutMs = 1500): Promise<boolean> {
  try {
    const client = getRedisClient();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Redis connection check timed out')), timeoutMs)
    );

    const pingPromise = (async () => {
      if (client.status !== 'ready') {
        await client.connect().catch(() => {});
      }
      return client.ping();
    })();

    const pong = await Promise.race([pingPromise, timeoutPromise]);
    return pong === 'PONG';
  } catch (error) {
    return false;
  }
}

