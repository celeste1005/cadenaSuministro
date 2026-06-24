import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const reportRouter = router({
  getCategories: protectedProcedure
    .query(async ({ ctx }) => {
      const definitions = await ctx.kpiService.listDefinitions();
      const catMap: Record<string, { code: string; name: string; color: string; displayOrder: number; count: number }> = {};
      for (const def of definitions) {
        const catCode = def.category?.code || 'OTHER';
        if (!catMap[catCode]) {
          catMap[catCode] = {
            code: catCode,
            name: def.category?.name || catCode,
            color: def.category?.color || '#6b7280',
            displayOrder: def.category?.displayOrder ?? 99,
            count: 0,
          };
        }
        catMap[catCode].count++;
      }
      return Object.values(catMap).sort((a, b) => a.displayOrder - b.displayOrder);
    }),

  getReportPreview: protectedProcedure
    .input(z.object({
      period: z.enum(['monthly', 'quarterly', 'annual']),
      year: z.number().int(),
      month: z.number().int().min(1).max(12).optional(),
      quarter: z.number().int().min(1).max(4).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = getPeriodRange(input.period, input.year, input.month, input.quarter);
      const definitions = await ctx.kpiService.listDefinitions();

      const catGroups: Record<string, { code: string; name: string; items: any[] }> = {};
      for (const def of definitions) {
        const catCode = def.category?.code || 'OTHER';
        if (!catGroups[catCode]) {
          catGroups[catCode] = { code: catCode, name: def.category?.name || catCode, items: [] };
        }
        const snapshot = await ctx.kpiService.getKpiSnapshotFromDb(
          ctx.user.companyId,
          def.code,
          startDate,
          endDate,
        );
        catGroups[catCode].items.push({
          code: def.code,
          name: def.name,
          unit: def.unit,
          value: snapshot?.value ?? null,
          target: snapshot?.target ?? def.targetValue,
          status: snapshot?.status ?? 'neutral',
        });
      }

      const categories = Object.values(catGroups);
      const totalKpis = categories.reduce((a, c) => a + c.items.length, 0);
      const onTarget = categories.reduce((a, c) => a + c.items.filter(i => i.status === 'success' || i.status === 'neutral').length, 0);
      const critical = categories.reduce((a, c) => a + c.items.filter(i => i.status === 'danger').length, 0);
      const warning = categories.reduce((a, c) => a + c.items.filter(i => i.status === 'warning').length, 0);

      return {
        periodLabel: getPeriodLabel(input.period, input.year, input.month, input.quarter),
        totalKpis,
        onTarget,
        warning,
        critical,
        averageCompliance: totalKpis > 0 ? Math.round((onTarget / totalKpis) * 100) : 0,
        categories,
      };
    }),
});

const MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

function getPeriodRange(
  period: 'monthly' | 'quarterly' | 'annual',
  year: number,
  month?: number,
  quarter?: number,
): { startDate: Date; endDate: Date } {
  switch (period) {
    case 'monthly': {
      const m = month || new Date().getMonth() + 1;
      return { startDate: new Date(year, m - 1, 1), endDate: new Date(year, m, 0, 23, 59, 59) };
    }
    case 'quarterly': {
      const q = quarter || Math.ceil((new Date().getMonth() + 1) / 3);
      const startMonth = (q - 1) * 3;
      return { startDate: new Date(year, startMonth, 1), endDate: new Date(year, startMonth + 3, 0, 23, 59, 59) };
    }
    case 'annual':
    default:
      return { startDate: new Date(year, 0, 1), endDate: new Date(year, 11, 31, 23, 59, 59) };
  }
}

function getPeriodLabel(
  period: 'monthly' | 'quarterly' | 'annual',
  year: number,
  month?: number,
  quarter?: number,
): string {
  switch (period) {
    case 'monthly': return `${MONTHS_SHORT[(month || new Date().getMonth()) - 1]} ${year}`;
    case 'quarterly': return `Q${quarter || Math.ceil((new Date().getMonth() + 1) / 3)} ${year}`;
    case 'annual': return `${year}`;
  }
}
