import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface InternationalTradeUnitCostResult {
  unitCost: number;
  totalOperationCost: number;
  totalUnits: number;
}

@Injectable()
export class InternationalTradeUnitCostCalculator {
  private readonly logger = new Logger(InternationalTradeUnitCostCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Costo Unitario de Importación/Exportación
   * Fórmula: (Costo Total Operación / Unidades Importadas/Exportadas)
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
    type: 'IMPORT' | 'EXPORT'
  ): Promise<InternationalTradeUnitCostResult> {
    this.logger.log(`Calculating International Trade Unit Cost for company ${companyId}, type ${type}`);

    // Costos de importación/exportación
    const costs = await this.prisma.operationalCost.aggregate({
      _sum: { amount: true },
      where: {
        companyId,
        costDate: { gte: startDate, lte: endDate },
        costType: type,
      },
    });

    // Unidades importadas/exportadas (esto vendría de una tabla de comercio exterior o similar)
    // Para simplificar, usaremos los movimientos de inventario marcados con el tipo
    const movements = await this.prisma.inventoryMovement.aggregate({
      _sum: { quantity: true },
      where: {
        companyId,
        movementDate: { gte: startDate, lte: endDate },
        // En un sistema real, tendríamos una tabla de operaciones de comercio exterior
        // Aquí asumimos que se mapean a tipos de movimiento específicos
        movementType: type === 'IMPORT' ? 'PURCHASE' : 'SALE',
      },
    });

    const totalOperationCost = Number(costs._sum.amount || 0);
    const totalUnits = Number(movements._sum.quantity || 0);
    const unitCost = totalUnits > 0 ? totalOperationCost / totalUnits : 0;

    return {
      unitCost: Number(unitCost.toFixed(2)),
      totalOperationCost,
      totalUnits,
    };
  }
}
