import { z } from 'zod';
import { ModuleCode } from '@erp/shared-types';

export const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  legalName: z.string().optional(),
  taxNumber: z.string().optional(),
  currency: z.string().min(3).max(3).optional(),
  fiscalYearStart: z.number().min(1).max(12).optional(),
  timezone: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

export const branchSchema = z.object({
  code: z.string().min(2).max(10).toUpperCase(),
  name: z.string().min(2),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isHeadquarters: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const moduleToggleSchema = z.object({
  moduleCode: z.nativeEnum(ModuleCode),
  isEnabled: z.boolean(),
});

export const systemSettingSchema = z.object({
  category: z.string().min(1),
  key: z.string().min(1),
  value: z.unknown(),
});
