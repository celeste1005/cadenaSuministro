import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import {
  KPI_CATEGORIES,
  KPI_DEFINITIONS,
} from './seed-kpi-data';

const prisma = new PrismaClient();

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function computeStatus(actual: number, target: number, direction: 'up' | 'down'): string {
  const deviation = direction === 'up'
    ? ((target - actual) / target) * 100
    : ((actual - target) / target) * 100;
  if (deviation <= 5) return 'good';
  if (deviation <= 15) return 'warning';
  return 'bad';
}

async function seedKpiCatalog(companyId: string) {
  const categoryIdByCode = new Map<string, number>();

  for (const cat of KPI_CATEGORIES) {
    const category = await prisma.kpiCategory.upsert({
      where: { code: cat.code },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
      create: {
        code: cat.code,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
    });
    categoryIdByCode.set(cat.code, category.id);
  }

  const kpiIdByCode = new Map<string, number>();

  for (const kpi of KPI_DEFINITIONS) {
    const categoryId = categoryIdByCode.get(kpi.categoryCode);
    if (!categoryId) continue;

    const definition = await prisma.kpiDefinition.upsert({
      where: { code: kpi.code },
      update: {
        categoryId,
        name: kpi.name,
        description: kpi.description,
        objective: kpi.description,
        formula: kpi.formula,
        unit: kpi.unit,
        unitType: kpi.unitType,
        indicatorClass: kpi.indicatorClass,
        direction: kpi.direction,
        targetValue: kpi.targetValue,
        responsibleRole: kpi.responsibleRole,
        dataSource: `chart:${kpi.chartType}`,
        periodicity: 'monthly',
        isActive: true,
      },
      create: {
        code: kpi.code,
        categoryId,
        name: kpi.name,
        description: kpi.description,
        objective: kpi.description,
        formula: kpi.formula,
        unit: kpi.unit,
        unitType: kpi.unitType,
        indicatorClass: kpi.indicatorClass,
        direction: kpi.direction,
        targetValue: kpi.targetValue,
        responsibleRole: kpi.responsibleRole,
        dataSource: `chart:${kpi.chartType}`,
        periodicity: 'monthly',
        isActive: true,
      },
    });
    kpiIdByCode.set(kpi.code, definition.id);
  }

  const currentYear = new Date().getFullYear();
  let valuesCreated = 0;

  for (const kpi of KPI_DEFINITIONS) {
    const kpiId = kpiIdByCode.get(kpi.code);
    if (!kpiId) continue;

    for (let month = 0; month < 12; month++) {
      const target = Number(kpi.targetValue);
      const factor = 0.85 + Math.random() * 0.3;
      const actual = Math.round(target * factor * 100) / 100;
      
      const varianceAbsolute = Math.round((actual - target) * 100) / 100;
      const variancePercentage = Math.round((varianceAbsolute / target) * 10000) / 100;

      await prisma.kpiValue.create({
        data: {
          kpiId,
          companyId,
          periodDate: new Date(Date.UTC(currentYear, month, 1)),
          actualValue: actual,
          targetValue: target,
          varianceAbsolute,
          variancePercentage,
          status: computeStatus(actual, target, kpi.direction as 'up' | 'down'),
          dataSourceMetadata: { source: 'seed', monthLabel: MONTH_LABELS[month] },
        },
      });
      valuesCreated++;
    }
  }

  return { valuesCreated };
}

async function seedBusinessData(companyId: string) {
  // 1. Proveedores
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { code: 'SUP-001', name: 'Logistics Pro Global', contactPerson: 'John Doe', email: 'john@logpro.com', phone: '12345', companyId } }),
    prisma.supplier.create({ data: { code: 'SUP-002', name: 'Empaques de Colombia', contactPerson: 'Maria G.', email: 'maria@empaques.co', phone: '67890', companyId } }),
  ]);

  // 2. Productos
  const products = await Promise.all([
    prisma.product.create({ data: { sku: 'SKU-001', name: 'Pallet Madera Estándar', category: 'Almacenamiento', unitOfMeasure: 'und', minStock: 200, companyId } }),
    prisma.product.create({ data: { sku: 'SKU-002', name: 'Cinta de Embalaje 50mm', category: 'Consumibles', unitOfMeasure: 'rollo', minStock: 100, companyId } }),
  ]);

  // 3. Bodegas
  const warehouse = await prisma.warehouse.create({
    data: { name: 'CEDI Principal Bogotá', code: 'CEDI-BOG', address: 'Calle 80 #12-34', city: 'Bogotá', totalAreaM2: 2500, companyId }
  });

  // 4. Vehículos
  const vehicle = await prisma.vehicle.create({
    data: { plateNumber: 'TRK-123', brand: 'Kenworth', model: 'T800', vehicleType: 'Tractomula', maxWeightKg: 35000, status: 'AVAILABLE', companyId }
  });

  // 5. Ventas (Clientes implícitos)
  const sale = await prisma.sale.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      customerName: 'Tiendas Éxito S.A.',
      customerDocument: '900.123.456-1',
      saleDate: new Date(),
      totalAmount: 15000000,
      grossProfit: 3000000,
      companyId,
      lines: {
        create: {
          productId: products[0].id,
          quantity: 100,
          unitPrice: 150000,
          totalPrice: 15000000
        }
      }
    }
  });

  // 6. Algunos movimientos de ejemplo
  await prisma.inventoryMovement.create({
    data: { 
      productId: products[0].id, 
      warehouseId: warehouse.id, 
      movementType: 'IN', 
      quantity: 500, 
      companyId, 
      movementDate: new Date(),
      notes: 'Carga inicial' 
    }
  });

  return { suppliers, products, warehouse, vehicle, sale };
}

async function main() {
  const passwordHash = await bcrypt.hash('demo123', 10);

  console.log('Limpiando base de datos...');
  await prisma.kpiValue.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.importExportRecord.deleteMany();
  await prisma.dispatch.deleteMany();
  await prisma.saleLine.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseOrderLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.employee.deleteMany();

  const company = await prisma.company.upsert({
    where: { taxId: 'DEMO-900123456' },
    update: {},
    create: {
      taxId: 'DEMO-900123456',
      legalName: 'Empresa Demo Cadena de Suministros S.A.S',
      tradeName: 'Demo Logistics',
      country: 'Colombia',
      city: 'Bogotá',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador del sistema',
      permissions: { modules: ['*'], companyId: company.id },
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    update: { passwordHash, roleId: adminRole.id },
    create: {
      email: 'admin@demo.local',
      passwordHash,
      fullName: 'Administrador Demo',
      roleId: adminRole.id,
    },
  });

  console.log('Sembrando catálogo de KPIs y series históricas...');
  const kpiStats = await seedKpiCatalog(company.id);

  console.log('Sembrando datos de negocio (Proveedores, Productos, Bodegas)...');
  await seedBusinessData(company.id);

  console.log('Seed Completo Finalizado con Éxito');
  console.log(`- Registros de KPI creados: ${kpiStats.valuesCreated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
