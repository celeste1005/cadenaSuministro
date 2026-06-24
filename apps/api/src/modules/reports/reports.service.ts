import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfGeneratorService } from './pdf/pdf-generator.service';
import { PdfRendererService, KpiReportData, ReportSummary } from './pdf/pdf-renderer.service';
import { KpiService } from '../kpi/kpi.service';
import { TransportService } from '../transport/transport.service';
import { PeriodType, KpiSnapshot, KpiCategoryGroup } from '@project/shared';
import { KPI_CATEGORY_ORDER, getKpisByCategory } from '@project/shared';

const MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const KPI_CODES_BY_CATEGORY: Record<string, string[]> = {
  PURCHASING: ['NOR_DIS_IND_01', 'NOR_DIS_IND_02', 'NOR_DIS_IND_03', 'NOR_DIS_IND_04'],
  INVENTORY: ['NOR_DIS_IND_05', 'NOR_DIS_IND_06', 'NOR_DIS_IND_07', 'NOR_DIS_IND_08', 'NOR_DIS_IND_09', 'NOR_DIS_IND_10', 'NOR_DIS_IND_11'],
  WAREHOUSING: ['NOR_DIS_IND_12', 'NOR_DIS_IND_13', 'NOR_DIS_IND_14', 'NOR_DIS_IND_15', 'NOR_DIS_IND_16', 'NOR_DIS_IND_17'],
  TRANSPORT: ['NOR_DIS_IND_18', 'NOR_DIS_IND_19', 'NOR_DIS_IND_20'],
  CUSTOMER_SERVICE: ['NOR_DIS_IND_21', 'NOR_DIS_IND_22', 'NOR_DIS_IND_23', 'NOR_DIS_IND_24', 'NOR_DIS_IND_25', 'NOR_DIS_IND_26', 'NOR_DIS_IND_27'],
  INTERNATIONAL_TRADE: ['NOR_DIS_IND_28'],
};

const CATEGORY_INFO: Record<string, { name: string; color: string; displayOrder: number }> = {
  PURCHASING: { name: 'Compras y Abastecimiento', color: '#3b82f6', displayOrder: 1 },
  INVENTORY: { name: 'Inventarios y Producción', color: '#10b981', displayOrder: 2 },
  WAREHOUSING: { name: 'Almacenamiento y Bodegaje', color: '#f59e0b', displayOrder: 3 },
  TRANSPORT: { name: 'Transporte y Distribución', color: '#8b5cf6', displayOrder: 4 },
  CUSTOMER_SERVICE: { name: 'Servicio al Cliente', color: '#ec4899', displayOrder: 5 },
  INTERNATIONAL_TRADE: { name: 'Importaciones y Exportaciones', color: '#06b6d4', displayOrder: 6 },
};

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: PdfGeneratorService,
    private readonly pdfRenderer: PdfRendererService,
    private readonly kpiService: KpiService,
    private readonly transportService: TransportService,
  ) {}

  async generateTransportKpiReport(companyId: string, year: number, userId: string) {
    this.logger.log(`Generating Transport KPI Report for company ${companyId}, year ${year}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    const monthlyData = await this.transportService.getTransportVsSalesMonthly(companyId, year);

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

    return this.pdfGenerator.generateTransportVsSalesReport(reportData);
  }

  async generateFullKpiReport(
    companyId: string,
    periodType: PeriodType,
    year: number,
    userId: string,
    month?: number,
    quarter?: number,
  ): Promise<Buffer> {
    this.logger.log(`Generating full KPI report for company ${companyId}, ${periodType} ${year}`);

    const [user, company] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.company.findUnique({ where: { id: companyId } }),
    ]);

    const { periodLabel, startDate, endDate } = this.getPeriodRange(periodType, year, month, quarter);

    const categories: KpiCategoryGroup[] = [];
    let totalKpis = 0;
    let onTarget = 0;
    let warning = 0;
    let critical = 0;
    let complianceSum = 0;
    const categoryCharts: Record<string, string> = {};
    let hasAlerts = false;
    let alertLevel: 'success' | 'warning' | 'danger' = 'success';
    let alertMessage = 'Todos los indicadores se encuentran dentro de los rangos esperados.';

    for (const catCode of KPI_CATEGORY_ORDER) {
      const codes = KPI_CODES_BY_CATEGORY[catCode];
      if (!codes) continue;

      const items: KpiSnapshot[] = [];

      for (const code of codes) {
        const snapshot = await this.kpiService.getKpiSnapshotFromDb(companyId, code, startDate, endDate);
        if (snapshot) {
          const raw = snapshot as any;
          items.push({
            ...raw,
            periodDate: raw.periodDate instanceof Date ? raw.periodDate.toISOString() : String(raw.periodDate),
          } as KpiSnapshot);
        }
      }

      if (items.length === 0) continue;

      const category = {
        code: catCode,
        name: CATEGORY_INFO[catCode]?.name || catCode,
        color: CATEGORY_INFO[catCode]?.color || '#6b7280',
        displayOrder: CATEGORY_INFO[catCode]?.displayOrder || 0,
      };

      categories.push({ category, items });

      for (const item of items) {
        totalKpis++;
        if (item.status === 'success' || item.status === 'neutral') onTarget++;
        else if (item.status === 'warning') warning++;
        else if (item.status === 'danger') critical++;

        const value = Number(item.value ?? 0);
        const target = Number(item.target ?? 1);
        complianceSum += target > 0 ? Math.min(value / target, 1) : 0;
      }

      const chartImage = await this.pdfRenderer.generateCategoryChart(category.name, items);
      if (chartImage) categoryCharts[catCode] = chartImage;
    }

    if (critical > 0) {
      hasAlerts = true;
      alertLevel = 'danger';
      alertMessage = `${critical} indicador(es) se encuentran en estado crítico y requieren atención inmediata de la gerencia.`;
    } else if (warning > 0) {
      hasAlerts = true;
      alertLevel = 'warning';
      alertMessage = `${warning} indicador(es) están en alerta. Se recomienda revisar las causas y tomar acciones correctivas.`;
    }

    const averageCompliance = totalKpis > 0
      ? Math.round((complianceSum / totalKpis) * 100)
      : 0;

    const summary: ReportSummary = {
      totalKpis,
      onTarget,
      warning,
      critical,
      averageCompliance,
      onTargetPercent: totalKpis > 0 ? Math.round((onTarget / totalKpis) * 100) : 0,
    };

    const reportData: KpiReportData = {
      companyInfo: {
        name: company?.legalName || 'SCILIP Logistics',
        logo: company?.logoUrl || '',
        address: company?.address || '',
      },
      generatedBy: user?.fullName || 'Sistema SCILIP',
      generatedAt: new Date().toLocaleString('es-ES'),
      periodType,
      periodLabel,
      year,
      month,
      quarter,
      categories,
      summary,
      hasAlerts,
      alertLevel,
      alertMessage,
      categoryCharts,
    };

    return this.pdfRenderer.renderKpiReport(reportData);
  }

  async generateComparativeReport(
    companyId: string,
    year: number,
    userId: string,
  ): Promise<Buffer> {
    const previousYear = year - 1;
    this.logger.log(`Generating comparative report ${previousYear} vs ${year}`);

    const [user, company] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.company.findUnique({ where: { id: companyId } }),
    ]);

    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    const prevYearStart = new Date(previousYear, 0, 1);
    const prevYearEnd = new Date(previousYear, 11, 31);

    const annualComparison: ComparativeReportData['annualComparison'] = [];
    let improvedCount = 0;
    let worsenedCount = 0;
    let stableCount = 0;

    const allKpiCodes = Object.values(KPI_CODES_BY_CATEGORY).flat();

    for (const code of allKpiCodes) {
      const [currentSnapshot, previousSnapshot] = await Promise.all([
        this.kpiService.getKpiSnapshotFromDb(companyId, code, yearStart, yearEnd),
        this.kpiService.getKpiSnapshotFromDb(companyId, code, prevYearStart, prevYearEnd),
      ]);

      const currentValue = Number(currentSnapshot?.value ?? 0);
      const prevValue = Number(previousSnapshot?.value ?? 0);
      const variance = prevValue > 0 ? ((currentValue - prevValue) / prevValue) * 100 : 0;

      const definition = getKpisByCategory('').find(k => k.code === code);

      annualComparison.push({
        code,
        name: currentSnapshot?.name || code,
        unit: currentSnapshot?.unit || definition?.unit || '',
        currentYearValue: currentValue,
        previousYearValue: prevValue,
        variance: Math.round(variance * 100) / 100,
      });

      if (Math.abs(variance) < 5) stableCount++;
      else if (variance > 0) improvedCount++;
      else worsenedCount++;
    }

    const monthlyComparison: ComparativeReportData['monthlyComparison'] = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0);
      const prevMonthStart = new Date(previousYear, i, 1);
      const prevMonthEnd = new Date(previousYear, i + 1, 0);

      const [currentData, prevData] = await Promise.all([
        this.getAverageKpiValue(companyId, monthStart, monthEnd),
        this.getAverageKpiValue(companyId, prevMonthStart, prevMonthEnd),
      ]);

      const diff = prevData > 0 ? ((currentData - prevData) / prevData) * 100 : 0;
      monthlyComparison.push({
        month: MONTHS_SHORT[i],
        previousYear: Math.round(prevData * 100) / 100,
        currentYear: Math.round(currentData * 100) / 100,
        diff: Math.round(diff * 100) / 100,
      });
    }

    const monthlyChartImage = await this.pdfRenderer.generateComparativeChart(monthlyComparison);

    return this.pdfRenderer.renderComparativeReport({
      companyInfo: {
        name: company?.legalName || 'SCILIP Logistics',
        logo: company?.logoUrl || '',
        address: company?.address || '',
      },
      generatedBy: user?.fullName || 'Sistema SCILIP',
      generatedAt: new Date().toLocaleString('es-ES'),
      year,
      previousYear,
      periodLabel: `${previousYear} vs ${year}`,
      improvedCount,
      worsenedCount,
      stableCount,
      annualComparison,
      monthlyComparison,
      monthlyChartImage,
    });
  }

  private async getAverageKpiValue(companyId: string, startDate: Date, endDate: Date): Promise<number> {
    const allCodes = Object.values(KPI_CODES_BY_CATEGORY).flat();
    let total = 0;
    let count = 0;

    for (const code of allCodes) {
      const snapshot = await this.kpiService.getKpiSnapshotFromDb(companyId, code, startDate, endDate);
      if (snapshot?.value != null) {
        total += Number(snapshot.value);
        count++;
      }
    }

    return count > 0 ? total / count : 0;
  }

  private getPeriodRange(
    periodType: PeriodType,
    year: number,
    month?: number,
    quarter?: number,
  ): { periodLabel: string; startDate: Date; endDate: Date } {
    switch (periodType) {
      case 'monthly': {
        const m = month || new Date().getMonth() + 1;
        return {
          periodLabel: `${MONTHS_SHORT[m - 1]} ${year}`,
          startDate: new Date(year, m - 1, 1),
          endDate: new Date(year, m, 0, 23, 59, 59),
        };
      }
      case 'quarterly': {
        const q = quarter || Math.ceil((new Date().getMonth() + 1) / 3);
        const startMonth = (q - 1) * 3;
        return {
          periodLabel: `Q${q} ${year}`,
          startDate: new Date(year, startMonth, 1),
          endDate: new Date(year, startMonth + 3, 0, 23, 59, 59),
        };
      }
      case 'annual':
      default: {
        return {
          periodLabel: `${year}`,
          startDate: new Date(year, 0, 1),
          endDate: new Date(year, 11, 31, 23, 59, 59),
        };
      }
    }
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

interface ComparativeReportData {
  companyInfo: { name: string; logo: string; address: string };
  generatedBy: string;
  generatedAt: string;
  year: number;
  previousYear: number;
  periodLabel: string;
  improvedCount: number;
  worsenedCount: number;
  stableCount: number;
  annualComparison: Array<{
    code: string;
    name: string;
    unit: string;
    currentYearValue: number;
    previousYearValue: number;
    variance: number;
  }>;
  monthlyComparison: Array<{
    month: string;
    previousYear: number;
    currentYear: number;
    diff: number;
  }>;
  monthlyChartImage: string;
}
