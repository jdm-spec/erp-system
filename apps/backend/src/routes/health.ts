import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/prisma.js';
import { checkRedisConnection } from '../config/redis.js';
import { ApiResponse } from '@erp/shared-types';

export const healthRouter = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseConnection();
  const redisHealthy = await checkRedisConnection();

  const isHealthy = dbHealthy; // DB is critical; Redis can be graceful in dev

  const response: ApiResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    timestamp: string;
    services: {
      database: 'connected' | 'disconnected';
      redis: 'connected' | 'disconnected';
    };
    memory: NodeJS.MemoryUsage;
  }> = {
    success: isHealthy,
    data: {
      status: isHealthy && redisHealthy ? 'healthy' : isHealthy ? 'degraded' : 'unhealthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'connected' : 'disconnected',
        redis: redisHealthy ? 'connected' : 'disconnected',
      },
      memory: process.memoryUsage(),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string,
    },
  };

  const statusCode = isHealthy ? 200 : 503;
  return res.status(statusCode).json(response);
});

