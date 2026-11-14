import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifySync } from 'otplib';
import { prisma } from '../../config/prisma.js';
import { getRedisClient } from '../../config/redis.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/errorHandler.js';
import { ModuleCode, ActionPermission, AuthSession, UserSummary } from '@erp/shared-types';

interface TokenPayload {
  userId: string;
  companyId: string;
  email: string;
  isSuperAdmin: boolean;
}

export class AuthService {
  private static parseDurationToSeconds(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 7 * 86400; // default 7 days
    }
  }

  // Generate short-lived access token
  public static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  // Generate long-lived refresh token and store in Redis with rotation
  public static async generateRefreshToken(payload: TokenPayload): Promise<string> {
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    try {
      const redis = getRedisClient();
      const ttl = this.parseDurationToSeconds(env.JWT_REFRESH_EXPIRES_IN);
      await redis.set(`refresh_token:${payload.userId}:${refreshToken}`, 'valid', 'EX', ttl);
    } catch (err) {
      console.warn('Redis unavailable for refresh token storage, proceeding with signed JWT');
    }

    return refreshToken;
  }

  public static async revokeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(`refresh_token:${userId}:${refreshToken}`);
    } catch {}
  }

  public static async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys(`refresh_token:${userId}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {}
  }

  // Compile aggregate permissions for user roles
  public static async getUserPermissions(userId: string): Promise<Record<string, string[]>> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              where: { isAllowed: true },
            },
          },
        },
      },
    });

    const permissionMap: Record<string, Set<string>> = {};

    for (const ur of userRoles) {
      for (const perm of ur.role.permissions) {
        if (!permissionMap[perm.moduleCode]) {
          permissionMap[perm.moduleCode] = new Set();
        }
        permissionMap[perm.moduleCode].add(perm.action);
      }
    }

    const result: Record<string, string[]> = {};
    for (const [moduleCode, actions] of Object.entries(permissionMap)) {
      result[moduleCode] = Array.from(actions);
    }
    return result;
  }

  // Compile full user session
  public static async buildAuthSession(userId: string): Promise<AuthSession> {
    const user = await prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      include: {
        company: true,
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'USER_INACTIVE', 'User account is inactive or deleted');
    }

    const payload: TokenPayload = {
      userId: user.id,
      companyId: user.companyId,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    };

    const accessToken = this.generateAccessToken(payload);
    const permissions = await this.getUserPermissions(user.id);

    // Fetch enabled modules for company
    const moduleSettings = await prisma.companyModuleSetting.findMany({
      where: { companyId: user.companyId, isEnabled: true },
    });

    const userSummary: UserSummary = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleNames: user.userRoles.map((ur) => ur.role.name),
      companyId: user.companyId,
      branchId: user.branchId,
      isSuperAdmin: user.isSuperAdmin,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    return {
      user: userSummary,
      accessToken,
      company: {
        id: user.company.id,
        code: user.company.code,
        name: user.company.name,
        currency: user.company.currency,
      },
      permissions,
      enabledModules: moduleSettings.map((ms) => ms.moduleCode as ModuleCode),
    };
  }

  // Register a new company and initial SuperAdmin
  public static async registerCompany(data: {
    companyName: string;
    companyCode: string;
    currency: string;
    timezone: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
  }): Promise<{ session: AuthSession; refreshToken: string }> {
    const existingCompany = await prisma.company.findUnique({
      where: { code: data.companyCode },
    });
    if (existingCompany) {
      throw new AppError(409, 'COMPANY_EXISTS', `Company code ${data.companyCode} is already registered`);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.adminEmail },
    });
    if (existingUser) {
      throw new AppError(409, 'USER_EXISTS', `User with email ${data.adminEmail} already exists`);
    }

    const passwordHash = await bcrypt.hash(data.adminPassword, 12);

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Company
      const company = await tx.company.create({
        data: {
          code: data.companyCode,
          name: data.companyName,
          currency: data.currency,
          timezone: data.timezone,
        },
      });

      // 2. Create HQ Branch
      const branch = await tx.branch.create({
        data: {
          companyId: company.id,
          code: 'HQ',
          name: 'Headquarters',
          isHeadquarters: true,
        },
      });

      // 3. Create Super Admin Role with full permissions
      const adminRole = await tx.role.create({
        data: {
          companyId: company.id,
          name: 'Super Administrator',
          description: 'Full unconstrained system and business access',
          isSystem: true,
        },
      });

      // Populate permissions for all modules
      const moduleCodes = Object.values(ModuleCode);
      const actionTypes = Object.values(ActionPermission);
      const permissionData = [];

      for (const mod of moduleCodes) {
        for (const act of actionTypes) {
          permissionData.push({
            roleId: adminRole.id,
            moduleCode: mod,
            action: act,
            isAllowed: true,
          });
        }
      }
      await tx.permission.createMany({ data: permissionData });

      // Enable all default modules
      await tx.companyModuleSetting.createMany({
        data: moduleCodes.map((mod) => ({
          companyId: company.id,
          moduleCode: mod,
          isEnabled: true,
        })),
      });

      // 4. Create Initial User
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          branchId: branch.id,
          email: data.adminEmail.toLowerCase(),
          passwordHash,
          firstName: data.adminFirstName,
          lastName: data.adminLastName,
          isSuperAdmin: true,
        },
      });

      // Assign Super Admin Role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });

      return { user, company };
    });

    const session = await this.buildAuthSession(result.user.id);
    const refreshToken = await this.generateRefreshToken({
      userId: result.user.id,
      companyId: result.company.id,
      email: result.user.email,
      isSuperAdmin: true,
    });

    return { session, refreshToken };
  }

  // User Login
  public static async login(
    email: string,
    passwordPlain: string,
    twoFactorToken?: string
  ): Promise<{ session?: AuthSession; refreshToken?: string; requiresTwoFactor?: boolean }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase(), isDeleted: false },
    });

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new AppError(403, 'ACCOUNT_DISABLED', 'Your account has been deactivated');
    }

    const passwordMatches = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // 2FA Check
    if (user.twoFactorEnabled) {
      if (!twoFactorToken) {
        return { requiresTwoFactor: true };
      }

      if (!user.twoFactorSecret) {
        throw new AppError(500, '2FA_CONFIG_ERROR', '2FA is marked enabled but secret is missing');
      }

      const result = verifySync({
        token: twoFactorToken,
        secret: user.twoFactorSecret,
      });

      if (!result.valid) {
        throw new AppError(401, 'INVALID_2FA_TOKEN', 'Invalid 2FA authentication code');
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const session = await this.buildAuthSession(user.id);
    const refreshToken = await this.generateRefreshToken({
      userId: user.id,
      companyId: user.companyId,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    });

    return { session, refreshToken };
  }

  // Refresh token rotation
  public static async refreshAccessToken(oldRefreshToken: string): Promise<{ session: AuthSession; newRefreshToken: string }> {
    let payload: TokenPayload;
    try {
      payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is expired or invalid');
    }

    // Check Redis revocation
    try {
      const redis = getRedisClient();
      const status = await redis.get(`refresh_token:${payload.userId}:${oldRefreshToken}`);
      if (status !== 'valid') {
        throw new AppError(401, 'REVOKED_TOKEN', 'Refresh token has been revoked or already used');
      }
      // Revoke old token immediately (Rotation)
      await redis.del(`refresh_token:${payload.userId}:${oldRefreshToken}`);
    } catch (err) {
      if (err instanceof AppError) throw err;
    }

    const session = await this.buildAuthSession(payload.userId);
    const newRefreshToken = await this.generateRefreshToken({
      userId: payload.userId,
      companyId: payload.companyId,
      email: payload.email,
      isSuperAdmin: payload.isSuperAdmin,
    });

    return { session, newRefreshToken };
  }
}
