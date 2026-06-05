import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Action } from '../../modules/auth/casl-ability.factory';
import { TRPCError } from '@trpc/server';

const transportCostSchema = z.object({
  vehicleId: z.string().uuid().optional(),
  costType: z.string(),
  amount: z.number().positive(),
  costDate: z.coerce.date(),
  description: z.string().optional(),
  route: z.string().optional(),
});

export const transportRouter = router({
  // Obtener vehículos
  getVehicles: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.transportService.getVehicles(ctx.user.companyId);
    }),

  // Obtener costos de transporte
  getTransportCosts: protectedProcedure
    .input(z.object({
      vehicleId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.transportService.getTransportCosts(ctx.user.companyId, input);
    }),

  // Registrar un costo de transporte
  createTransportCost: protectedProcedure
    .input(transportCostSchema)
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Create, 'TransportCost')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para registrar costos de transporte',
        });
      }
      return ctx.transportService.createTransportCost(ctx.user.companyId, input);
    }),

  // Obtener resumen de transporte vs ventas
  getTransportVsSalesSummary: protectedProcedure
    .input(z.object({ year: z.number().int().default(new Date().getFullYear()) }))
    .query(async ({ ctx, input }) => {
      return ctx.transportService.getTransportVsSalesSummary(ctx.user.companyId, input.year);
    }),

  // Obtener datos mensuales de transporte vs ventas
  getTransportVsSalesMonthly: protectedProcedure
    .input(z.object({ year: z.number().int().default(new Date().getFullYear()) }))
    .query(async ({ ctx, input }) => {
      return ctx.transportService.getTransportVsSalesMonthly(ctx.user.companyId, input.year);
    }),
});
