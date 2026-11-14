import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { getRedisClient } from './config/redis.js';

const app = createApp();
const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`
🚀 Modular Customizable ERP Backend
📡 Running in [${env.NODE_ENV}] mode
🌐 Listening on http://localhost:${env.PORT}/api/v1
🩺 Health Check: http://localhost:${env.PORT}/api/v1/health
  `);
});

// Graceful Shutdown on termination signals
async function handleShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('HTTP server closed.');

    try {
      await prisma.$disconnect();
      console.log('Prisma database connection disconnected.');
    } catch (err) {
      console.error('Error disconnecting Prisma:', err);
    }

    try {
      const redis = getRedisClient();
      await redis.quit();
      console.log('Redis connection closed.');
    } catch (err) {
      console.error('Error closing Redis connection:', err);
    }

    process.exit(0);
  });

  // Force exit after 10s timeout
  setTimeout(() => {
    console.error('Forcefully terminating process after 10s shutdown timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

