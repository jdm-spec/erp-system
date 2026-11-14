import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuditService } from '../audit/audit.service.js';
import { ModuleCode, CompanyDto, BranchDto, CompanyModuleSettingDto } from '@erp/shared-types';

export class SettingsService {
  // Company Profile
  public static async getCompanyProfile(companyId: string): Promise<CompanyDto> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company not found');

    return {
      id: company.id,
      code: company.code,
      name: company.name,
      legalName: company.legalName,
      taxNumber: company.taxNumber,
      currency: company.currency,
      fiscalYearStart: company.fiscalYearStart,
      timezone: company.timezone,
      logoUrl: company.logoUrl,
      isActive: company.isActive,
    };
  }

  public static async updateCompanyProfile(
    companyId: string,
    data: Partial<CompanyDto>,
    userId?: string,
    ipAddress?: string
  ): Promise<CompanyDto> {
    const old = await prisma.company.findUnique({ where: { id: companyId } });
    if (!old) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company not found');

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: data.name,
        legalName: data.legalName,
        taxNumber: data.taxNumber,
        currency: data.currency,
        fiscalYearStart: data.fiscalYearStart,
        timezone: data.timezone,
        logoUrl: data.logoUrl,
        updatedBy: userId,
      },
    });

    await AuditService.recordAuditLog({
      companyId,
      userId,
      moduleCode: ModuleCode.SETTINGS,
      entityName: 'Company',
      entityId: companyId,
      action: 'UPDATE',
      oldValue: old,
      newValue: updated,
      ipAddress,
    });

    return this.getCompanyProfile(companyId);
  }

  // Branches
  public static async getBranches(companyId: string): Promise<BranchDto[]> {
    const branches = await prisma.branch.findMany({
      where: { companyId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
    });

    return branches.map((b) => ({
      id: b.id,
      companyId: b.companyId,
      code: b.code,
      name: b.name,
      address: b.address,
      city: b.city,
      state: b.state,
      country: b.country,
      postalCode: b.postalCode,
      phone: b.phone,
      email: b.email,
      isHeadquarters: b.isHeadquarters,
      isActive: b.isActive,
    }));
  }

  public static async createBranch(
    companyId: string,
    data: any,
    userId?: string,
    ipAddress?: string
  ): Promise<BranchDto> {
    const existing = await prisma.branch.findFirst({
      where: { companyId, code: data.code, isDeleted: false },
    });
    if (existing) {
      throw new AppError(409, 'BRANCH_CODE_EXISTS', `Branch code "${data.code}" already exists`);
    }

    if (data.isHeadquarters) {
      // Unset previous HQ
      await prisma.branch.updateMany({
        where: { companyId, isHeadquarters: true },
        data: { isHeadquarters: false },
      });
    }

    const branch = await prisma.branch.create({
      data: {
        companyId,
        code: data.code,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        phone: data.phone,
        email: data.email,
        isHeadquarters: data.isHeadquarters,
        isActive: data.isActive,
        createdBy: userId,
      },
    });

    await AuditService.recordAuditLog({
      companyId,
      userId,
      moduleCode: ModuleCode.SETTINGS,
      entityName: 'Branch',
      entityId: branch.id,
      action: 'CREATE',
      newValue: branch,
      ipAddress,
    });

    return branch;
  }

  public static async updateBranch(
    companyId: string,
    branchId: string,
    data: any,
    userId?: string,
    ipAddress?: string
  ): Promise<BranchDto> {
    const old = await prisma.branch.findFirst({ where: { id: branchId, companyId } });
    if (!old) throw new AppError(404, 'BRANCH_NOT_FOUND', 'Branch not found');

    if (data.isHeadquarters) {
      await prisma.branch.updateMany({
        where: { companyId, isHeadquarters: true, id: { not: branchId } },
        data: { isHeadquarters: false },
      });
    }

    const updated = await prisma.branch.update({
      where: { id: branchId },
      data: {
        ...data,
        updatedBy: userId,
      },
    });

    await AuditService.recordAuditLog({
      companyId,
      userId,
      moduleCode: ModuleCode.SETTINGS,
      entityName: 'Branch',
      entityId: branchId,
      action: 'UPDATE',
      oldValue: old,
      newValue: updated,
      ipAddress,
    });

    return updated;
  }

  public static async deleteBranch(
    companyId: string,
    branchId: string,
    userId?: string,
    ipAddress?: string
  ): Promise<void> {
    const branch = await prisma.branch.findFirst({ where: { id: branchId, companyId } });
    if (!branch) throw new AppError(404, 'BRANCH_NOT_FOUND', 'Branch not found');
    if (branch.isHeadquarters) {
      throw new AppError(400, 'CANNOT_DELETE_HQ', 'Headquarters branch cannot be deleted');
    }

    await prisma.branch.update({
      where: { id: branchId },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    });

    await AuditService.recordAuditLog({
      companyId,
      userId,
      moduleCode: ModuleCode.SETTINGS,
      entityName: 'Branch',
      entityId: branchId,
      action: 'DELETE',
      oldValue: branch,
      ipAddress,
    });
  }

  // Module Toggles
  public static async getModuleSettings(companyId: string): Promise<CompanyModuleSettingDto[]> {
    const allModules = Object.values(ModuleCode);
    const existing = await prisma.companyModuleSetting.findMany({
      where: { companyId },
    });

    const existingMap = new Map(existing.map((e) => [e.moduleCode, e.isEnabled]));

    return allModules.map((m) => ({
      moduleCode: m,
      isEnabled: existingMap.has(m) ? !!existingMap.get(m) : true,
    }));
  }

  public static async toggleModule(
    companyId: string,
    moduleCode: ModuleCode,
    isEnabled: boolean,
    userId?: string,
    ipAddress?: string
  ): Promise<CompanyModuleSettingDto> {
    const updated = await prisma.companyModuleSetting.upsert({
      where: {
        companyId_moduleCode: { companyId, moduleCode },
      },
      create: { companyId, moduleCode, isEnabled },
      update: { isEnabled },
    });

    await AuditService.recordAuditLog({
      companyId,
      userId,
      moduleCode: ModuleCode.SETTINGS,
      entityName: 'ModuleSetting',
      entityId: `${companyId}_${moduleCode}`,
      action: isEnabled ? 'ENABLE_MODULE' : 'DISABLE_MODULE',
      newValue: { moduleCode, isEnabled },
      ipAddress,
    });

    return { moduleCode: updated.moduleCode as ModuleCode, isEnabled: updated.isEnabled };
  }

  // System Configuration (Key/Value)
  public static async getSystemSettings(companyId: string, category?: string): Promise<Record<string, unknown>> {
    const where: any = { companyId };
    if (category) where.category = category;

    const settings = await prisma.systemSetting.findMany({ where });
    const result: Record<string, unknown> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  public static async setSystemSetting(
    companyId: string,
    category: string,
    key: string,
    value: unknown,
    userId?: string,
    ipAddress?: string
  ): Promise<void> {
    await prisma.systemSetting.upsert({
      where: { companyId_key: { companyId, key } },
      create: { companyId, category, key, value: value as any },
      update: { category, value: value as any },
    });

    await AuditService.recordAuditLog({
      companyId,
      userId,
      moduleCode: ModuleCode.SETTINGS,
      entityName: 'SystemSetting',
      entityId: key,
      action: 'SET_SETTING',
      newValue: { category, key, value },
      ipAddress,
    });
  }
}
