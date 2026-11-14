import { Router } from 'express';
import { AuditController } from './audit.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { ModuleCode, ActionPermission } from '@erp/shared-types';

export const auditRouter = Router();

auditRouter.use(authenticate);
auditRouter.get('/', requirePermission(ModuleCode.SETTINGS, ActionPermission.VIEW), AuditController.getLogs);
