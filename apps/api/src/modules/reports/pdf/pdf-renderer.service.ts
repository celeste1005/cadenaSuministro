import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { KpiSnapshot, KpiCategoryGroup, PeriodType } from '@project/shared';

export interface ReportCompanyInfo {
  name: string;
  logo: string;
  address: string;
}

export interface ReportSummary {
  totalKpis: number;
  onTarget: number;
  warning: number;
  critical: number;
  averageCompliance: number;
  onTargetPercent: number;
}

export interface KpiReportData {
  companyInfo: ReportCompanyInfo;
  generatedBy: string;
  generatedAt: string;
  periodType: PeriodType;
  periodLabel: string;
  year: number;
  month?: number;
  quarter?: number;
  categories: KpiCategoryGroup[];
  summary: ReportSummary;
  hasAlerts: boolean;
  alertLevel: 'success' | 'warning' | 'danger';
  alertMessage: string;
  categoryCharts: Record<string, string>;
}

export interface ComparativeReportData {
  companyInfo: ReportCompanyInfo;
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

@Injectable()
export class PdfRendererService {
  private readonly logger = new Logger(PdfRendererService.name);

  constructor() {
    this.registerHelpers();
  }

  private registerHelpers(): void {
    if (!Handlebars.helpers.formatCurrency) {
      Handlebars.registerHelper('formatCurrency', (value: number) => {
        if (value == null || isNaN(value)) return '$0';
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(value);
      });
    }

    if (!Handlebars.helpers.formatPercentage) {
      Handlebars.registerHelper('formatPercentage', (value: number) => {
        if (value == null || isNaN(value)) return '0%';
        return `${Number(value).toFixed(1)}%`;
      });
    }

    if (!Handlebars.helpers.formatKpiValue) {
      Handlebars.registerHelper('formatKpiValue', (value: number, unit: string) => {
        if (value == null || isNaN(value)) return 'N/D';
        if (unit === '%') return `${Number(value).toFixed(1)}%`;
        if (unit === '$/und' || unit === '$/m²' || unit === '$/emp' || unit === '$USD/und' || unit === '$/cond') {
          return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: unit.includes('USD') ? 'USD' : 'COP',
            minimumFractionDigits: 0,
          }).format(value);
        }
        if (unit === 'ratio') return Number(value).toFixed(2);
        return new Intl.NumberFormat('es-CO').format(Number(value.toFixed(1)));
      });
    }

    if (!Handlebars.helpers.getTrendIcon) {
      Handlebars.registerHelper('getTrendIcon', (trend: string) => {
        if (trend === 'up') return '📈';
        if (trend === 'down') return '📉';
        return '➡️';
      });
    }

    if (!Handlebars.helpers.getTrendColor) {
      Handlebars.registerHelper('getTrendColor', (trend: string) => {
        if (trend === 'up') return '#ef4444';
        if (trend === 'down') return '#10b981';
        return '#6b7280';
      });
    }

    if (!Handlebars.helpers.eq) {
      Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    }

    if (!Handlebars.helpers.gt) {
      Handlebars.registerHelper('gt', (a: any, b: any) => a > b);
    }

    if (!Handlebars.helpers.lt) {
      Handlebars.registerHelper('lt', (a: any, b: any) => a < b);
    }

    if (!Handlebars.helpers['@index_plus_1']) {
      Handlebars.registerHelper('@index_plus_1', (index: number) => index + 1);
    }
  }

  private loadTemplate(name: string): string {
    const distPath = join(__dirname, 'templates', name);
    const srcPath = join(__dirname, '..', '..', '..', '..', 'src', 'modules', 'reports', 'pdf', 'templates', name);
    if (existsSync(distPath)) {
      return readFileSync(distPath, 'utf8');
    }
    return readFileSync(srcPath, 'utf8');
  }

  private loadCss(name: string): string {
    const distPath = join(__dirname, 'templates', 'styles', name);
    const srcPath = join(__dirname, '..', '..', '..', '..', 'src', 'modules', 'reports', 'pdf', 'templates', 'styles', name);
    if (existsSync(distPath)) {
      return readFileSync(distPath, 'utf8');
    }
    return readFileSync(srcPath, 'utf8');
  }

  async renderKpiReport(data: KpiReportData): Promise<Buffer> {
    this.logger.log(`Rendering KPI report for ${data.companyInfo.name} - ${data.periodLabel}`);

    const templateHtml = this.loadTemplate('kpi-report.hbs');
    let reportCss = '';
    try {
      reportCss = this.loadCss('report.css');
    } catch {
      this.logger.warn('report.css not found, using inline styles');
    }

    const template = Handlebars.compile(templateHtml);

    const html = template({
      ...data,
      reportCss,
    });

    return this.generatePdf(html);
  }

  async renderComparativeReport(data: ComparativeReportData): Promise<Buffer> {
    this.logger.log(`Rendering comparative report ${data.previousYear} vs ${data.year}`);

    const templateHtml = this.loadTemplate('comparative-report.hbs');
    let reportCss = '';
    try {
      reportCss = this.loadCss('report.css');
    } catch {
      this.logger.warn('report.css not found, using inline styles');
    }

    const template = Handlebars.compile(templateHtml);

    const html = template({
      ...data,
      reportCss,
    });

    return this.generatePdf(html);
  }

  async generateCategoryChart(
    categoryName: string,
    items: KpiSnapshot[],
  ): Promise<string> {
    const labels = items.map(i => i.code);
    const values = items.map(i => Number(i.value ?? 0));
    const targets = items.map(i => Number(i.target ?? 0));
    const unit = items[0]?.unit || '';

    const chartHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { margin: 0; padding: 15px; font-family: Arial, sans-serif; }
          canvas { width: 700px; height: 300px; }
        </style>
      </head>
      <body>
        <canvas id="chart"></canvas>
        <script>
          const ctx = document.getElementById('chart').getContext('2d');
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(labels)},
              datasets: [
                {
                  label: 'Valor Actual',
                  data: ${JSON.stringify(values)},
                  backgroundColor: 'rgba(59, 130, 246, 0.7)',
                  borderColor: 'rgb(59, 130, 246)',
                  borderWidth: 1
                },
                {
                  label: 'Meta',
                  data: ${JSON.stringify(targets)},
                  type: 'line',
                  borderColor: 'rgb(16, 185, 129)',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  pointRadius: 4,
                  pointBackgroundColor: 'rgb(16, 185, 129)'
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: '${categoryName}',
                  font: { size: 14 }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: '${unit}' }
                }
              }
            }
          });
        </script>
      </body>
      </html>
    `;

    return this.screenshotChart(chartHtml);
  }

  async generateComparativeChart(
    monthlyComparison: ComparativeReportData['monthlyComparison'],
  ): Promise<string> {
    const chartHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { margin: 0; padding: 15px; }
          canvas { width: 750px; height: 350px; }
        </style>
      </head>
      <body>
        <canvas id="chart"></canvas>
        <script>
          const ctx = document.getElementById('chart').getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: ${JSON.stringify(monthlyComparison.map(m => m.month))},
              datasets: [
                {
                  label: 'Año Anterior',
                  data: ${JSON.stringify(monthlyComparison.map(m => m.previousYear))},
                  borderColor: 'rgb(156, 163, 175)',
                  backgroundColor: 'rgba(156, 163, 175, 0.1)',
                  borderDash: [5, 5],
                  tension: 0.3,
                  fill: false
                },
                {
                  label: 'Año Actual',
                  data: ${JSON.stringify(monthlyComparison.map(m => m.currentYear))},
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.3,
                  fill: true
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Evolución Mensual Comparada',
                  font: { size: 14 }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Valor' }
                }
              }
            }
          });
        </script>
      </body>
      </html>
    `;

    return this.screenshotChart(chartHtml);
  }

  private async screenshotChart(html: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html);
      await new Promise(resolve => setTimeout(resolve, 1200));
      const element = await page.$('#chart');
      if (!element) {
        this.logger.warn('Chart element not found');
        return '';
      }
      const screenshot = await element.screenshot({ type: 'png' });
      return `data:image/png;base64,${screenshot.toString('base64')}`;
    } finally {
      await browser.close();
    }
  }

  private async generatePdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.emulateMediaType('screen');

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          bottom: '15mm',
          left: '12mm',
          right: '12mm',
        },
        headerTemplate: '<div style="font-size: 7px; text-align: center; width: 100%; color: #94a3b8;">SCILIP - Sistema de Control de Indicadores Logísticos</div>',
        footerTemplate: '<div style="font-size: 7px; text-align: center; width: 100%; color: #94a3b8;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
        displayHeaderFooter: true,
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}
