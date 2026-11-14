import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  twoFactorToken: z.string().optional(),
});

export const registerCompanySchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyCode: z.string().min(2, 'Company code must be at least 2 characters').toUpperCase(),
  currency: z.string().min(3).max(3).default('USD'),
  timezone: z.string().default('UTC'),
  adminEmail: z.string().email('Valid admin email required'),
  adminPassword: z.string().min(8, 'Admin password must be at least 8 characters'),
  adminFirstName: z.string().min(1, 'First name required'),
  adminLastName: z.string().min(1, 'Last name required'),
});

export const verifyTwoFactorSchema = z.object({
  token: z.string().length(6, '2FA token must be 6 digits'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});
