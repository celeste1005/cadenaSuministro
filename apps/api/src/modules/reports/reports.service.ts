import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfGeneratorService } from './pdf/pdf-generator.service';
import { TransportService } from '../transport/transport.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: PdfGeneratorService,
    private readonly transportService: TransportService,
  ) {}

  async generateTransportKpiReport(companyId: string, year: number, userId: string) {
    this.logger.log(`Generating Transport KPI Report for company ${companyId}, year ${year}`);

    // 1. Obtener datos del servicio de transporte
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const monthlyData = await this.transportService.getTransportVsSalesMonthly(companyId, year);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    const company = await this.prisma.company.findUnique({
      where: { id: companyId }
    });

    // 2. Preparar datos para el generador PDF
    const reportData = {
      year,
      monthlyData: monthlyData.map(d => ({
        month: d.month,
        transportCost: d.transportCost,
        totalSales: d.totalSales,
        percentage: d.percentage,
      })),
      summary: {
        totalTransportCost: monthlyData.reduce((acc, d) => acc + d.transportCost, 0),
        totalSales: monthlyData.reduce((acc, d) => acc + d.totalSales, 0),
        averagePercentage: monthlyData.length > 0 
          ? monthlyData.reduce((acc, d) => acc + d.percentage, 0) / monthlyData.length 
          : 0,
        trend: this.calculateTrend(monthlyData) as 'up' | 'down' | 'stable',
      },
      companyInfo: {
        name: company?.legalName || 'SCILIP Logistics',
        logo: company?.logoUrl || '',
        address: company?.address || '',
      },
      generatedBy: user?.fullName || 'Sistema SCILIP',
    };

    // 3. Generar el PDF
    return this.pdfGenerator.generateTransportVsSalesReport(reportData);
  }

  private calculateTrend(data: any[]): string {
    if (data.length < 2) return 'stable';
    const last = data[data.length - 1].percentage;
    const prev = data[data.length - 2].percentage;
    if (last > prev + 0.1) return 'up';
    if (last < prev - 0.1) return 'down';
    return 'stable';
  }
}