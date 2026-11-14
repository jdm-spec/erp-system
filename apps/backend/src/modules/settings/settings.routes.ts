import { Router } from 'express';
import { SettingsController } from './settings.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { ModuleCode, ActionPermission } from '@erp/shared-types';

export const settingsRouter = Router();

settingsRouter.use(authenticate);

// Company
settingsRouter.get('/company', requirePermission(ModuleCode.SETTINGS, ActionPermission.VIEW), SettingsController.getCompany);
settingsRouter.put('/company', requirePermission(ModuleCode.SETTINGS, ActionPermission.EDIT), SettingsController.updateCompany);

// Branches
settingsRouter.get('/branches', requirePermission(ModuleCode.SETTINGS, ActionPermission.VIEW), SettingsController.getBranches);
settingsRouter.post('/branches', requirePermission(ModuleCode.SETTINGS, ActionPermission.CREATE), SettingsController.createBranch);
settingsRouter.put('/branches/:id', requirePermission(ModuleCode.SETTINGS, ActionPermission.EDIT), SettingsController.updateBranch);
settingsRouter.delete('/branches/:id', requirePermission(ModuleCode.SETTINGS, ActionPermission.DELETE), SettingsController.deleteBranch);

// Modules
settingsRouter.get('/modules', requirePermission(ModuleCode.SETTINGS, ActionPermission.VIEW), SettingsController.getModules);
settingsRouter.post('/modules/toggle', requirePermission(ModuleCode.SETTINGS, ActionPermission.EDIT), SettingsController.toggleModule);

// System Settings
settingsRouter.get('/system', requirePermission(ModuleCode.SETTINGS, ActionPermission.VIEW), SettingsController.getSystemSettings);
settingsRouter.post('/system', requirePermission(ModuleCode.SETTINGS, ActionPermission.EDIT), SettingsController.setSystemSetting);
