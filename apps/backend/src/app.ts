import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { configureSecurityMiddleware } from './middleware/security.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  // Trust proxy if running behind reverse proxy (Nginx / Cloudflare / Load Balancers)
  app.set('trust proxy', 1);

  // Security Middlewares
  app.use(configureSecurityMiddleware());

  // Body Parsing Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // Request Auditing & Sanitized Logging
  app.use(requestLogger);

  // Mount API v1 Routes
  app.use('/api/v1', apiRouter);

  // 404 Route Handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} does not exist`,
      },
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

