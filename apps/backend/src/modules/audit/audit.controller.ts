import { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AuditController {
  public static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20;

      const logs = await AuditService.getAuditLogs(req.user.companyId, {
        page,
        pageSize,
        moduleCode: req.query.moduleCode as string,
        entityName: req.query.entityName as string,
        entityId: req.query.entityId as string,
        userId: req.query.userId as string,
      });

      res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }
}
