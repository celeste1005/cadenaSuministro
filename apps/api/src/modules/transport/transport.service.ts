import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransportVsSalesCalculator } from './calculators/transport-vs-sales.calculator';
// ... rest of imports
import { CostPerDriverCalculator } from './calculators/cost-per-driver.calculator';
import { TransportComparativeCalculator } from './calculators/transport-comparative.calculator';

@Injectable()
export class TransportService {
  private readonly logger = new Logger(TransportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transportVsSalesCalculator: TransportVsSalesCalculator,
    private readonly costPerDriverCalculator: CostPerDriverCalculator,
    private readonly transportComparativeCalculator: TransportComparativeCalculator,
  ) {}

  // --- CRUD Vehicles ---
  async getVehicles(companyId: string) {
    return this.prisma.vehicle.findMany({
      where: { companyId, isActive: true },
    });
  }

  // --- CRUD Transport Costs ---
  async getTransportCosts(companyId: string, filters?: any) {
    return this.prisma.transportCost.findMany({
      where: {
        companyId,
        ...(filters?.vehicleId ? { vehicleId: filters.vehicleId } : {}),
      },
      include: { vehicle: true },
      orderBy: { costDate: 'desc' },
    });
  }

  async createTransportCost(companyId: string, data: any) {
    return this.prisma.transportCost.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async calculateTransportVsSales(companyId: string, year: number) {
    return this.transportVsSalesCalculator.calculate(companyId, year);
  }

  async calculateCostPerDriver(companyId: string, startDate: Date, endDate: Date) {
    return this.costPerDriverCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateTransportComparative(companyId: string, startDate: Date, endDate: Date) {
    return this.transportComparativeCalculator.calculate(companyId, startDate, endDate);
  }

  async getTransportVsSalesMonthly(companyId: string, year: number) {
    return this.transportVsSalesCalculator.getMonthlyData(companyId, year);
  }
    
  async getTransportVsSalesSummary(companyId: string, year: number) {
    const data = await this.transportVsSalesCalculator.calculate(companyId, year);
    const monthlyData = await this.getTransportVsSalesMonthly(companyId, year);
    // Calcular tendencia (comparando últimos 2 meses con datos)
    const validMonths = monthlyData.filter(m => m.totalSales > 0);
    let trend: 'up' | 'down' | 'stable' = 'stable';
    
    if (validMonths.length >= 2) {
      const last = validMonths[validMonths.length - 1].percentage;
      const prev = validMonths[validMonths.length - 2].percentage;
      if (last > prev) trend = 'up';
      else if (last < prev) trend = 'down';
    }

    return {
      ...data,
      averagePercentage: data.percentage,
      trend,
    };
  }
}
