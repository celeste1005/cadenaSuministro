import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async processPurchaseOrders(orders: any[], source: string) {
    this.logger.log(`Processing ${orders.length} purchase orders from ${source}`);
    // Lógica para mapear y guardar órdenes
    return { count: orders.length, status: 'processed' };
  }

  async processSales(sales: any[], source: string) {
    this.logger.log(`Processing ${sales.length} sales from ${source}`);
    // Lógica para mapear y guardar ventas
    return { count: sales.length, status: 'processed' };
  }

  async processInventoryMovements(movements: any[], source: string) {
    this.logger.log(`Processing ${movements.length} inventory movements from ${source}`);
    // Lógica para mapear y guardar movimientos
    return { count: movements.length, status: 'processed' };
  }
}
