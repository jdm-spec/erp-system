import { Request, Response, NextFunction } from 'express';
import { RbacService } from './rbac.service.js';
import { createRoleSchema, updateRoleSchema } from './rbac.schemas.js';
import { AppError } from '../../middleware/errorHandler.js';
import { ApiResponse } from '@erp/shared-types';

export class RbacController {
  public static async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const roles = await RbacService.getRoles(req.user.companyId);
      const response: ApiResponse = { success: true, data: roles };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async getRoleById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const role = await RbacService.getRoleById(req.user.companyId, req.params.id);
      res.status(200).json({ success: true, data: role });
    } catch (err) {
      next(err);
    }
  }

  public static async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const validated = createRoleSchema.parse(req.body);
      const role = await RbacService.createRole(req.user.companyId, validated);
      res.status(201).json({ success: true, message: 'Role created successfully', data: role });
    } catch (err) {
      next(err);
    }
  }

  public static async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const validated = updateRoleSchema.parse(req.body);
      const role = await RbacService.updateRole(req.user.companyId, req.params.id, validated);
      res.status(200).json({ success: true, message: 'Role updated successfully', data: role });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      await RbacService.deleteRole(req.user.companyId, req.params.id);
      res.status(200).json({ success: true, message: 'Role deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
