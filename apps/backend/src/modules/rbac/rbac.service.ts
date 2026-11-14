import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { ModuleCode, ActionPermission, RoleDto } from '@erp/shared-types';

export class RbacService {
  public static async getRoles(companyId: string): Promise<RoleDto[]> {
    const roles = await prisma.role.findMany({
      where: { companyId, isDeleted: false },
      include: { permissions: true },
      orderBy: { createdAt: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      createdAt: r.createdAt.toISOString(),
      permissions: r.permissions.map((p) => ({
        moduleCode: p.moduleCode as ModuleCode,
        action: p.action as ActionPermission,
        isAllowed: p.isAllowed,
      })),
    }));
  }

  public static async getRoleById(companyId: string, roleId: string): Promise<RoleDto> {
    const role = await prisma.role.findFirst({
      where: { id: roleId, companyId, isDeleted: false },
      include: { permissions: true },
    });

    if (!role) {
      throw new AppError(404, 'ROLE_NOT_FOUND', 'Role not found');
    }

    return {
      id: role.id,
      companyId: role.companyId,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt.toISOString(),
      permissions: role.permissions.map((p) => ({
        moduleCode: p.moduleCode as ModuleCode,
        action: p.action as ActionPermission,
        isAllowed: p.isAllowed,
      })),
    };
  }

  public static async createRole(
    companyId: string,
    data: { name: string; description?: string; permissions: { moduleCode: ModuleCode; action: ActionPermission; isAllowed: boolean }[] }
  ): Promise<RoleDto> {
    const existing = await prisma.role.findFirst({
      where: { companyId, name: data.name, isDeleted: false },
    });

    if (existing) {
      throw new AppError(409, 'ROLE_EXISTS', `Role "${data.name}" already exists`);
    }

    const created = await prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          companyId,
          name: data.name,
          description: data.description,
          isSystem: false,
        },
      });

      if (data.permissions && data.permissions.length > 0) {
        await tx.permission.createMany({
          data: data.permissions.map((p) => ({
            roleId: role.id,
            moduleCode: p.moduleCode,
            action: p.action,
            isAllowed: p.isAllowed,
          })),
        });
      }

      return role;
    });

    return this.getRoleById(companyId, created.id);
  }

  public static async updateRole(
    companyId: string,
    roleId: string,
    data: { name?: string; description?: string; permissions?: { moduleCode: ModuleCode; action: ActionPermission; isAllowed: boolean }[] }
  ): Promise<RoleDto> {
    const role = await prisma.role.findFirst({
      where: { id: roleId, companyId, isDeleted: false },
    });

    if (!role) {
      throw new AppError(404, 'ROLE_NOT_FOUND', 'Role not found');
    }

    await prisma.$transaction(async (tx) => {
      if (data.name || data.description !== undefined) {
        await tx.role.update({
          where: { id: roleId },
          data: {
            name: data.name,
            description: data.description,
          },
        });
      }

      if (data.permissions) {
        // Upsert permissions
        for (const p of data.permissions) {
          await tx.permission.upsert({
            where: {
              roleId_moduleCode_action: {
                roleId,
                moduleCode: p.moduleCode,
                action: p.action,
              },
            },
            create: {
              roleId,
              moduleCode: p.moduleCode,
              action: p.action,
              isAllowed: p.isAllowed,
            },
            update: {
              isAllowed: p.isAllowed,
            },
          });
        }
      }
    });

    return this.getRoleById(companyId, roleId);
  }

  public static async deleteRole(companyId: string, roleId: string): Promise<void> {
    const role = await prisma.role.findFirst({
      where: { id: roleId, companyId, isDeleted: false },
    });

    if (!role) {
      throw new AppError(404, 'ROLE_NOT_FOUND', 'Role not found');
    }

    if (role.isSystem) {
      throw new AppError(403, 'CANNOT_DELETE_SYSTEM_ROLE', 'System roles cannot be deleted');
    }

    await prisma.role.update({
      where: { id: roleId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
