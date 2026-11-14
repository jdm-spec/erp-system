import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service.js';
import { updateCompanySchema, branchSchema, moduleToggleSchema, systemSettingSchema } from './settings.schemas.js';
import { AppError } from '../../middleware/errorHandler.js';

export class SettingsController {
  public static async getCompany(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const company = await SettingsService.getCompanyProfile(req.user.companyId);
      res.status(200).json({ success: true, data: company });
    } catch (err) {
      next(err);
    }
  }

  public static async updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const data = updateCompanySchema.parse(req.body);
      const company = await SettingsService.updateCompanyProfile(
        req.user.companyId,
        data,
        req.user.userId,
        req.ip
      );
      res.status(200).json({ success: true, message: 'Company profile updated', data: company });
    } catch (err) {
      next(err);
    }
  }

  public static async getBranches(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const branches = await SettingsService.getBranches(req.user.companyId);
      res.status(200).json({ success: true, data: branches });
    } catch (err) {
      next(err);
    }
  }

  public static async createBranch(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const data = branchSchema.parse(req.body);
      const branch = await SettingsService.createBranch(
        req.user.companyId,
        data,
        req.user.userId,
        req.ip
      );
      res.status(201).json({ success: true, message: 'Branch created', data: branch });
    } catch (err) {
      next(err);
    }
  }

  public static async updateBranch(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const data = branchSchema.partial().parse(req.body);
      const branch = await SettingsService.updateBranch(
        req.user.companyId,
        req.params.id,
        data,
        req.user.userId,
        req.ip
      );
      res.status(200).json({ success: true, message: 'Branch updated', data: branch });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteBranch(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      await SettingsService.deleteBranch(req.user.companyId, req.params.id, req.user.userId, req.ip);
      res.status(200).json({ success: true, message: 'Branch deleted' });
    } catch (err) {
      next(err);
    }
  }

  public static async getModules(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const modules = await SettingsService.getModuleSettings(req.user.companyId);
      res.status(200).json({ success: true, data: modules });
    } catch (err) {
      next(err);
    }
  }

  public static async toggleModule(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const { moduleCode, isEnabled } = moduleToggleSchema.parse(req.body);
      const setting = await SettingsService.toggleModule(
        req.user.companyId,
        moduleCode,
        isEnabled,
        req.user.userId,
        req.ip
      );
      res.status(200).json({ success: true, message: 'Module setting updated', data: setting });
    } catch (err) {
      next(err);
    }
  }

  public static async getSystemSettings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const settings = await SettingsService.getSystemSettings(
        req.user.companyId,
        req.query.category as string
      );
      res.status(200).json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  public static async setSystemSetting(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const { category, key, value } = systemSettingSchema.parse(req.body);
      await SettingsService.setSystemSetting(
        req.user.companyId,
        category,
        key,
        value,
        req.user.userId,
        req.ip
      );
      res.status(200).json({ success: true, message: 'Setting saved' });
    } catch (err) {
      next(err);
    }
  }
}
