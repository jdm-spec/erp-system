import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ModuleCode, ActionPermission } from '@erp/shared-types';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ERP Database Seeding...');

  // 1. Create or Find Demo Company
  const company = await prisma.company.upsert({
    where: { code: 'APEX' },
    update: {},
    create: {
      code: 'APEX',
      name: 'Apex Global Industries',
      legalName: 'Apex Global Manufacturing & Trading Corp.',
      taxNumber: 'US-987654321',
      currency: 'USD',
      fiscalYearStart: 1, // January
      timezone: 'America/New_York',
    },
  });
  console.log(`✅ Company seeded: ${company.name} [${company.code}]`);

  // 2. Create Branches
  const hqBranch = await prisma.branch.upsert({
    where: {
      companyId_code: {
        companyId: company.id,
        code: 'HQ',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      code: 'HQ',
      name: 'Global Headquarters',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      isHeadquarters: true,
      isActive: true,
    },
  });

  await prisma.branch.upsert({
    where: {
      companyId_code: {
        companyId: company.id,
        code: 'DIST-W',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      code: 'DIST-W',
      name: 'West Coast Logistics Center',
      city: 'Reno',
      state: 'NV',
      country: 'United States',
      isHeadquarters: false,
      isActive: true,
    },
  });
  console.log(`✅ Branches seeded`);

  // 3. Seed Module Settings
  const allModules = Object.values(ModuleCode);
  for (const mod of allModules) {
    await prisma.companyModuleSetting.upsert({
      where: {
        companyId_moduleCode: {
          companyId: company.id,
          moduleCode: mod,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        moduleCode: mod,
        isEnabled: true,
      },
    });
  }
  console.log(`✅ ${allModules.length} Modules activated`);

  // 4. Seed Standard Roles & Permissions
  const adminRole = await prisma.role.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'Super Administrator',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'Super Administrator',
      description: 'Full unconstrained system and business access',
      isSystem: true,
    },
  });

  const allActions = Object.values(ActionPermission);
  for (const mod of allModules) {
    for (const act of allActions) {
      await prisma.permission.upsert({
        where: {
          roleId_moduleCode_action: {
            roleId: adminRole.id,
            moduleCode: mod,
            action: act,
          },
        },
        update: { isAllowed: true },
        create: {
          roleId: adminRole.id,
          moduleCode: mod,
          action: act,
          isAllowed: true,
        },
      });
    }
  }

  // Finance Manager Role
  const financeRole = await prisma.role.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'Finance Manager',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'Finance Manager',
      description: 'Full control over ledger, payments, tax, and financial reporting',
      isSystem: false,
    },
  });

  const financeActions = [ActionPermission.VIEW, ActionPermission.CREATE, ActionPermission.EDIT, ActionPermission.APPROVE, ActionPermission.EXPORT];
  for (const act of financeActions) {
    await prisma.permission.upsert({
      where: {
        roleId_moduleCode_action: {
          roleId: financeRole.id,
          moduleCode: ModuleCode.FINANCE,
          action: act,
        },
      },
      update: { isAllowed: true },
      create: {
        roleId: financeRole.id,
        moduleCode: ModuleCode.FINANCE,
        action: act,
        isAllowed: true,
      },
    });
  }

  // 5. Seed Super Admin User
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@apex.com' },
    update: { passwordHash },
    create: {
      companyId: company.id,
      branchId: hqBranch.id,
      email: 'admin@apex.com',
      passwordHash,
      firstName: 'Alexander',
      lastName: 'Vance',
      isSuperAdmin: true,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });
  console.log(`✅ Default SuperAdmin created: admin@apex.com / Admin123!`);

  // 6. Seed System Settings
  await prisma.systemSetting.upsert({
    where: {
      companyId_key: {
        companyId: company.id,
        key: 'invoice_numbering_series',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      category: 'NUMBERING',
      key: 'invoice_numbering_series',
      value: { prefix: 'INV', separator: '-', padding: 5, nextNumber: 1001 },
    },
  });

  console.log('✨ Database Seeding Completed Successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
