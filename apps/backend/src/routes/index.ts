import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { rbacRouter } from '../modules/rbac/rbac.routes.js';
import { auditRouter } from '../modules/audit/audit.routes.js';
import { settingsRouter } from '../modules/settings/settings.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/roles', rbacRouter);
apiRouter.use('/audit-logs', auditRouter);
apiRouter.use('/settings', settingsRouter);

// Root API v1 meta endpoint
apiRouter.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Modular Customizable ERP API v1 is running',
    version: '1.0.0',
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'],
    },
  });
});
