import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { KpiService } from './kpi.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class KpiCronService implements OnApplicationBootstrap {
  private readonly logger = new Logger(KpiCronService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly kpiService: KpiService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onApplicationBootstrap() {
    this.scheduleMonthlyKpis();
  }

  scheduleMonthlyKpis() {
    // Leemos el intervalo dinámico desde las variables de entorno, o por defecto a medianoche del día 1 (mensual)
    const cronTime = this.configService.get<string>('KPI_MONTHLY_CRON', '0 0 1 * *');
    
    const job = new CronJob(cronTime, () => {
      this.logger.log(`Executing dynamic monthly KPI calculation job!`);
      this.calculateMonthlyKpis();
    });

    this.schedulerRegistry.addCronJob('calculate-monthly-kpis', job);
    job.start();
    
    this.logger.log(`Dynamic Monthly KPI Job scheduled with pattern: ${cronTime}`);
  }

  async calculateMonthlyKpis() {
    this.logger.log('Starting monthly KPI calculations for all active companies...');
    
    // Obtener todas las empresas
    const companies = await this.prisma.company.findMany();
    const periodDate = new Date();
    periodDate.setDate(1); // Set to start of current month
    periodDate.setMonth(periodDate.getMonth() - 1); // El cálculo es del mes anterior que ya cerró
    
    const startDate = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
    const endDate = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0);

    for (const company of companies) {
      try {
        // Ejemplo 1: Rotación de Mercancía (Productividad)
        const rotation = await this.kpiService.getMerchandiseRotation(company.id, startDate, endDate);
        await this.kpiService.saveKpiValue('NOR_DIS_IND_08', rotation.rotationRate, endDate, company.id);

        // Ejemplo 2: Costo de Transporte vs Ventas (Productividad)
        const transportSales = await this.kpiService.getTransportVsSales(company.id, startDate.getFullYear());
        await this.kpiService.saveKpiValue('NOR_DIS_IND_18', transportSales.percentage, endDate, company.id);

        this.logger.log(`Successfully calculated monthly KPIs for company: ${company.id}`);
      } catch (error) {
        this.logger.error(`Error calculating KPIs for company ${company.id}: ${error.message}`);
      }
    }
  }
}
