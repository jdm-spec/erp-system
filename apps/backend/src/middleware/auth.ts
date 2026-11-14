import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';
import { AuthService } from '../modules/auth/auth.service.js';
import { ModuleCode, ActionPermission } from '@erp/shared-types';

export interface AuthenticatedUser {
  userId: string;
  companyId: string;
  branchId?: string | null;
  email: string;
  isSuperAdmin: boolean;
  permissions: Record<string, string[]>;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Authentication token required'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
      companyId: string;
      email: string;
      isSuperAdmin: boolean;
    };

    const permissions = await AuthService.getUserPermissions(payload.userId);

    req.user = {
      userId: payload.userId,
      companyId: payload.companyId,
      email: payload.email,
      isSuperAdmin: payload.isSuperAdmin,
      permissions,
    };

    next();
  } catch (err) {
    return next(new AppError(401, 'INVALID_TOKEN', 'Access token is expired or invalid'));
  }
}

// Server-side permission check (Rule 5: "Never trust the frontend: enforce permissions on server for every request")
export function requirePermission(moduleCode: ModuleCode, action: ActionPermission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    }

    // SuperAdmin bypasses role check
    if (req.user.isSuperAdmin) {
      return next();
    }

    const modulePermissions = req.user.permissions[moduleCode] || [];
    if (!modulePermissions.includes(action)) {
      return next(
        new AppError(
          403,
          'FORBIDDEN_ACTION',
          `Insufficient permissions: Requires ${action} on module ${moduleCode}`
        )
      );
    }

    next();
  };
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.isSuperAdmin) {
    return next(new AppError(403, 'FORBIDDEN_ADMIN_ONLY', 'This action requires Super Admin privileges'));
  }
  next();
}
