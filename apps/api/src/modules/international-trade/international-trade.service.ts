import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InternationalTradeUnitCostCalculator } from './calculators/international-trade-unit-cost.calculator';

@Injectable()
export class InternationalTradeService {
  private readonly logger = new Logger(InternationalTradeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly unitCostCalculator: InternationalTradeUnitCostCalculator,
  ) {}

  // --- CRUD Operations ---
  async getOperations(companyId: string, filters?: any) {
    return this.prisma.importExportRecord.findMany({
      where: {
        companyId,
        ...(filters?.type ? { operationType: filters.type } : {}),
      },
      include: {
        product: true,
        supplier: true,
      },
      orderBy: { operationDate: 'desc' },
    });
  }

  async createOperation(companyId: string, data: any) {
    return this.prisma.importExportRecord.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async calculateUnitCost(companyId: string, startDate: Date, endDate: Date, type: 'IMPORT' | 'EXPORT') {
    return this.unitCostCalculator.calculate(companyId, startDate, endDate, type);
  }
}
