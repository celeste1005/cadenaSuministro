import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface MachinePerformanceResult {
  performancePercentage: number;
  realProduction: number;
  standardCapacity: number;
  period: string;
}

@Injectable()
export class MachinePerformanceCalculator {
  private readonly logger = new Logger(MachinePerformanceCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el Rendimiento de Máquinas
   * Fórmula: (Producción Real / Capacidad Estándar) * 100
   */
  async calculate(
    machineId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MachinePerformanceResult> {
    this.logger.log(`Calculating Machine Performance for machine ${machineId}`);

    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
      select: { name: true, efficiencyRate: true, maxCapacity: true },
    });

    if (!machine) {
      throw new Error('Machine not found');
    }

    const production = await this.prisma.productionRecord.aggregate({
      _sum: {
        quantityProduced: true,
      },
      where: {
        machineId,
        productionDate: { gte: startDate, lte: endDate },
      },
    });

    const realProduction = Number(production._sum.quantityProduced || 0);
    // Capacidad estándar = Capacidad Máxima * Tasa de Eficiencia (ajustada por tiempo del periodo si fuera necesario)
    // Para simplificar, usamos la capacidad máxima configurada.
    const standardCapacity = Number(machine.maxCapacity || 0);
    const performancePercentage = standardCapacity > 0 
      ? (realProduction / standardCapacity) * 100 
      : 0;

    return {
      performancePercentage: Number(performancePercentage.toFixed(2)),
      realProduction,
      standardCapacity,
      period: `${startDate.toISOString().slice(0,10)} to ${endDate.toISOString().slice(0,10)}`,
    };
  }
}
