import { Router } from 'express';
import { RbacController } from './rbac.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { ModuleCode, ActionPermission } from '@erp/shared-types';

export const rbacRouter = Router();

rbacRouter.use(authenticate);

rbacRouter.get('/', requirePermission(ModuleCode.SETTINGS, ActionPermission.VIEW), RbacController.getRoles);
rbacRouter.get('/:id', requirePermission(ModuleCode.SETTINGS, ActionPermission.VIEW), RbacController.getRoleById);
rbacRouter.post('/', requirePermission(ModuleCode.SETTINGS, ActionPermission.CREATE), RbacController.createRole);
rbacRouter.put('/:id', requirePermission(ModuleCode.SETTINGS, ActionPermission.EDIT), RbacController.updateRole);
rbacRouter.delete('/:id', requirePermission(ModuleCode.SETTINGS, ActionPermission.DELETE), RbacController.deleteRole);
