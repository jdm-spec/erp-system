import { prisma } from '../../config/prisma.js';
import { AuditLogDto, PaginatedResult } from '@erp/shared-types';

export interface RecordAuditParams {
  companyId: string;
  userId?: string | null;
  moduleCode: string;
  entityName: string;
  entityId: string;
  action: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuditService {
  public static async recordAuditLog(params: RecordAuditParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          companyId: params.companyId,
          userId: params.userId,
          moduleCode: params.moduleCode,
          entityName: params.entityName,
          entityId: params.entityId,
          action: params.action,
          oldValue: params.oldValue ? (params.oldValue as any) : undefined,
          newValue: params.newValue ? (params.newValue as any) : undefined,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }

  public static async getAuditLogs(
    companyId: string,
    params: {
      page?: number;
      pageSize?: number;
      moduleCode?: string;
      entityName?: string;
      entityId?: string;
      userId?: string;
    }
  ): Promise<PaginatedResult<AuditLogDto>> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (params.moduleCode) where.moduleCode = params.moduleCode;
    if (params.entityName) where.entityName = params.entityName;
    if (params.entityId) where.entityId = params.entityId;
    if (params.userId) where.userId = params.userId;

    const [items, totalItems] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items: items.map((log) => ({
        id: log.id,
        companyId: log.companyId,
        userId: log.userId,
        userEmail: log.user?.email,
        userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
        moduleCode: log.moduleCode,
        entityName: log.entityName,
        entityId: log.entityId,
        action: log.action,
        oldValue: log.oldValue,
        newValue: log.newValue,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt.toISOString(),
      })),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
