import { router, protectedProcedure } from '../trpc'; 
 import { z } from 'zod'; 
 import { Action } from '../../modules/auth/casl-ability.factory';
 import { TRPCError } from '@trpc/server';
 
 // Schema para filtros de KPI 
 export const kpiFiltersSchema = z.object({ 
   startDate: z.coerce.date(), 
   endDate: z.coerce.date(), 
   supplierId: z.string().uuid().optional(), 
   warehouseId: z.string().uuid().optional(),
   machineId: z.string().uuid().optional(),
   periodicity: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).default('monthly') 
 }); 
 
export const kpiInputSchema = kpiFiltersSchema.extend({ 
  code: z.string() 
}); 

const listDefinitionsSchema = z.object({
  categoryCode: z.string().optional(),
});

// Router de KPIs 
export const kpiRouter = router({
  listDefinitions: protectedProcedure
    .input(listDefinitionsSchema)
    .query(async ({ ctx, input }) => {
      return ctx.kpiService.listDefinitions(input.categoryCode);
    }),

  getKpiSnapshot: protectedProcedure
    .input(kpiInputSchema)
    .query(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Read, 'Kpi', { code: input.code } as any)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Acceso denegado al indicador ${input.code}`,
        });
      }
      const snapshot = await ctx.kpiService.getKpiSnapshotFromDb(
        ctx.user.companyId,
        input.code,
        input.startDate,
        input.endDate,
      );
      if (snapshot) {
        return snapshot;
      }
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Sin datos almacenados para ${input.code} en el periodo indicado`,
      });
    }),
   // Obtener datos de cualquier KPI con validación de permisos CASL
    getKpiData: protectedProcedure 
      .input(kpiInputSchema) 
      .query(async ({ ctx, input }) => { 
        const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
        
        // Verificación de permisos por código de KPI
        if (!ability.can(Action.Read, 'Kpi', { code: input.code } as any)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Acceso denegado: No tienes permisos para ver el indicador ${input.code}. Tu rol es: ${ctx.user.role.name}`,
          });
        }

        switch (input.code) {
          case 'NOR_DIS_IND_01': // Certificación de Proveedores
            return ctx.kpiService.getSupplierCertification(ctx.user.companyId);
          case 'NOR_DIS_IND_02': // Calidad de Pedidos
            return ctx.kpiService.getOrderQuality(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_03': // Entregas Perfectamente Recibidas
            return ctx.kpiService.calculatePerfectReceipts({
              companyId: ctx.user.companyId,
              startDate: input.startDate,
              endDate: input.endDate,
              supplierId: input.supplierId,
            });
          case 'NOR_DIS_IND_04': // Volumen de Compra
            return ctx.kpiService.getPurchaseVolume(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_05': // Capacidad de Producción Utilizada
            if (!input.machineId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'machineId es requerido' });
            return ctx.kpiService.getCapacityUtilization(input.machineId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_06': // Rendimiento de Máquinas
            if (!input.machineId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'machineId es requerido' });
            return ctx.kpiService.getMachinePerformance(input.machineId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_08': // Rotación de Mercancía
            return ctx.kpiService.getMerchandiseRotation(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_09': // Duración del Inventario
            return ctx.kpiService.getInventoryDuration(ctx.user.companyId, input.endDate);
          case 'NOR_DIS_IND_10': // Vejez del Inventario
            return ctx.kpiService.getInventoryAging(ctx.user.companyId);
          case 'NOR_DIS_IND_11': // Exactitud del Inventario
            return ctx.kpiService.getInventoryAccuracy(
              ctx.user.companyId,
              input.startDate,
              input.endDate,
            );
          case 'NOR_DIS_IND_12': // Costo de Almacenamiento por Unidad
            if (!input.warehouseId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'warehouseId es requerido' });
            return ctx.kpiService.getStoredUnitCost(input.warehouseId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_13': // Costo por Metro Cuadrado
            if (!input.warehouseId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'warehouseId es requerido' });
            return ctx.kpiService.getCostPerSquareMeter(input.warehouseId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_14': // Unidades por Empleado
            return ctx.kpiService.getUnitsPerEmployee(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_15': // Costo de Despacho por Empleado
            return ctx.kpiService.getDispatchCostPerEmployee(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_16': // Cumplimiento en Despacho
            return ctx.kpiService.getDispatchCompliance(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_17': // Costo por Unidad Despachada
            return ctx.kpiService.getDispatchedUnitCost(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_18': // Transporte vs Ventas
              return ctx.kpiService.getTransportVsSales(ctx.user.companyId, input.startDate.getFullYear());
          case 'NOR_DIS_IND_19': // Costo por Conductor
            return ctx.kpiService.getCostPerDriver(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_20': // Comparativo Transporte
            return ctx.kpiService.getTransportComparative(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_21': // Entregas a Tiempo
            return ctx.kpiService.getOnTimeDeliveries(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_22': // Entregas Completas
            return ctx.kpiService.getCompleteDeliveries(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_23': // Calidad Documentación
            return ctx.kpiService.getDocumentationAccuracy(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_24': // Entregas Perfectas
            return ctx.kpiService.getPerfectDeliveries(
              ctx.user.companyId,
              input.startDate,
              input.endDate,
            );
          case 'NOR_DIS_IND_25': // Costo Logístico vs Ventas
            return ctx.kpiService.getLogisticsCostVsSales(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_26': // Costo Logístico vs Utilidad
            return ctx.kpiService.getLogisticsCostVsProfit(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_27': // Costo CEDI vs Ventas
            return ctx.kpiService.getCediCostVsSales(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_28': // Costo Importación/Exportación
            // Por defecto Importación, pero se podría pasar por parámetro en el futuro
            return ctx.kpiService.getInternationalTradeUnitCost(ctx.user.companyId, input.startDate, input.endDate, 'IMPORT');
          default:
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: `Indicador ${input.code} no implementado aún`,
            });
        }
      }), 
   
   // Obtener series de tiempo para gráficos 
   getKpiTimeSeries: protectedProcedure 
     .input(kpiInputSchema) 
     .query(async ({ ctx, input }) => { 
       const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
       
       if (!ability.can(Action.Read, 'Kpi', { code: input.code } as any)) {
         throw new TRPCError({
           code: 'FORBIDDEN',
           message: `No tienes permiso para ver el indicador ${input.code}`,
         });
       }

       switch (input.code) {
         case 'NOR_DIS_IND_03':
            return ctx.kpiService.getPerfectReceiptsTimeSeries({
              companyId: ctx.user.companyId,
              startDate: input.startDate,
              endDate: input.endDate,
              supplierId: input.supplierId,
            });
         default: {
           const stored = await ctx.kpiService.getKpiTimeSeriesFromDb(
             ctx.user.companyId,
             input.code,
             input.startDate,
             input.endDate,
           );
           if (stored.length > 0) {
             return stored;
           }
           return [];
         }
       }
     }), 
 }); 
