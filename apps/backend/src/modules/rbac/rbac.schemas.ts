import { z } from 'zod';
import { ModuleCode, ActionPermission } from '@erp/shared-types';

export const permissionItemSchema = z.object({
  moduleCode: z.nativeEnum(ModuleCode),
  action: z.nativeEnum(ActionPermission),
  isAllowed: z.boolean(),
});

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.array(permissionItemSchema).default([]),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  permissions: z.array(permissionItemSchema).optional(),
});
