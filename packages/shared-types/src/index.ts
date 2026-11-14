export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export type BaseEntity = {
  id: string;
  companyId: string;
  branchId?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
};

export enum ModuleCode {
  FINANCE = 'FINANCE',
  INVENTORY = 'INVENTORY',
  PROCUREMENT = 'PROCUREMENT',
  SALES = 'SALES',
  CRM = 'CRM',
  HR_PAYROLL = 'HR_PAYROLL',
  MANUFACTURING = 'MANUFACTURING',
  SUPPLY_CHAIN = 'SUPPLY_CHAIN',
  PROJECTS = 'PROJECTS',
  QUALITY = 'QUALITY',
  ASSETS_MAINTENANCE = 'ASSETS_MAINTENANCE',
  BI_REPORTING = 'BI_REPORTING',
  SETTINGS = 'SETTINGS'
}

export enum ActionPermission {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  EXPORT = 'EXPORT'
}

export enum CustomFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  DROPDOWN = 'DROPDOWN',
  MULTI_SELECT = 'MULTI_SELECT',
  CHECKBOX = 'CHECKBOX',
  FILE = 'FILE',
  FORMULA = 'FORMULA'
}

export interface CustomFieldDefinitionDto {
  id: string;
  moduleCode: ModuleCode;
  entityName: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  isRequired: boolean;
  isVisible: boolean;
  displayOrder: number;
  options?: string[];
  defaultValue?: string;
  formulaExpression?: string;
}

// Auth & User Types
export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleNames: string[];
  companyId: string;
  branchId?: string | null;
  isSuperAdmin: boolean;
  twoFactorEnabled: boolean;
}

export interface AuthSession {
  user: UserSummary;
  accessToken: string;
  company: {
    id: string;
    code: string;
    name: string;
    currency: string;
  };
  permissions: Record<string, string[]>; // ModuleCode -> ActionPermission[]
  enabledModules: ModuleCode[];
}

// RBAC Types
export interface RoleDto {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  createdAt: string;
  permissions: {
    moduleCode: ModuleCode;
    action: ActionPermission;
    isAllowed: boolean;
  }[];
}

// Settings & Multi-tenancy Types
export interface CompanyDto {
  id: string;
  code: string;
  name: string;
  legalName?: string | null;
  taxNumber?: string | null;
  currency: string;
  fiscalYearStart: number;
  timezone: string;
  logoUrl?: string | null;
  isActive: boolean;
}

export interface BranchDto {
  id: string;
  companyId: string;
  code: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  isHeadquarters: boolean;
  isActive: boolean;
}

export interface CompanyModuleSettingDto {
  moduleCode: ModuleCode;
  isEnabled: boolean;
}

export interface SystemSettingDto {
  category: string;
  key: string;
  value: unknown;
}

// Audit Types
export interface AuditLogDto {
  id: string;
  companyId: string;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  moduleCode: string;
  entityName: string;
  entityId: string;
  action: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}
