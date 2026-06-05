import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryAccuracyCalculator } from './calculators/inventory-accuracy.calculator';
// ... rest of imports
import { CapacityUtilizationCalculator } from './calculators/capacity-utilization.calculator';
import { EconomicInventoryValueCalculator } from './calculators/economic-inventory-value.calculator';
import { InventoryAgingCalculator } from './calculators/inventory-aging.calculator';
import { InventoryDurationCalculator } from './calculators/inventory-duration.calculator';
import { MachinePerformanceCalculator } from './calculators/machine-performance.calculator';
import { MerchandiseRotationCalculator } from './calculators/merchandise-rotation.calculator';

@Injectable()
export class InventoryProductionService {
  private readonly logger = new Logger(InventoryProductionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryAccuracyCalculator: InventoryAccuracyCalculator,
    private readonly capacityUtilizationCalculator: CapacityUtilizationCalculator,
    private readonly economicInventoryValueCalculator: EconomicInventoryValueCalculator,
    private readonly inventoryAgingCalculator: InventoryAgingCalculator,
    private readonly inventoryDurationCalculator: InventoryDurationCalculator,
    private readonly machinePerformanceCalculator: MachinePerformanceCalculator,
    private readonly merchandiseRotationCalculator: MerchandiseRotationCalculator,
  ) {}

  // --- CRUD Products ---
  async getProducts(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId, isActive: true },
      include: { category: true },
    });
  }

  // --- CRUD Inventory Movements ---
  async getMovements(companyId: string, filters?: any) {
    return this.prisma.inventoryMovement.findMany({
      where: {
        companyId,
        ...(filters?.productId ? { productId: filters.productId } : {}),
        ...(filters?.warehouseId ? { warehouseId: filters.warehouseId } : {}),
      },
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { movementDate: 'desc' },
    });
  }

  async createMovement(companyId: string, data: any) {
    return this.prisma.inventoryMovement.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  // --- Physical Inventory (Audit) ---
  async createPhysicalInventory(companyId: string, data: any) {
    return this.prisma.physicalInventory.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async getPhysicalInventories(companyId: string) {
    return this.prisma.physicalInventory.findMany({
      where: { companyId },
      include: {
        product: true,
        warehouse: true,
        countedBy: true,
      },
      orderBy: { countDate: 'desc' },
    });
  }

  async calculateInventoryAccuracy(companyId: string, startDate: Date, endDate: Date) {
    return this.inventoryAccuracyCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateCapacityUtilization(machineId: string, startDate: Date, endDate: Date) {
    return this.capacityUtilizationCalculator.calculate(machineId, startDate, endDate);
  }

  async calculateMachinePerformance(machineId: string, startDate: Date, endDate: Date) {
    return this.machinePerformanceCalculator.calculate(machineId, startDate, endDate);
  }

  async calculateMerchandiseRotation(companyId: string, startDate: Date, endDate: Date) {
    return this.merchandiseRotationCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateInventoryDuration(companyId: string, endDate: Date) {
    return this.inventoryDurationCalculator.calculate(companyId, endDate);
  }

  async calculateInventoryAging(companyId: string) {
    return this.inventoryAgingCalculator.calculate(companyId);
  }
}
