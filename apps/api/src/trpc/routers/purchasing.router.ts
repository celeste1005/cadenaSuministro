import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Action } from '../../modules/auth/casl-ability.factory';
import { TRPCError } from '@trpc/server';

export const purchasingRouter = router({
  // Obtener órdenes de compra pendientes de aprobación
  getPendingApprovals: protectedProcedure
    .query(async ({ ctx }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      
      // Solo roles gerenciales pueden ver aprobaciones pendientes
      if (!ability.can(Action.Update, 'PurchaseOrder')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para gestionar aprobaciones',
        });
      }

      return ctx.purchasingService.getPendingApprovals();
    }),

  // Aprobar una orden
  approveOrder: protectedProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      
      if (!ability.can(Action.Update, 'PurchaseOrder')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para aprobar órdenes',
        });
      }

      return ctx.purchasingService.approveOrder(input.orderId, ctx.user.id);
    }),

  // Rechazar una orden
  rejectOrder: protectedProcedure
    .input(z.object({ 
      orderId: z.string().uuid(),
      reason: z.string().min(5, "Debes proporcionar un motivo de al menos 5 caracteres")
    }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      
      if (!ability.can(Action.Update, 'PurchaseOrder')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para rechazar órdenes',
        });
      }

      return ctx.purchasingService.rejectOrder(input.orderId, ctx.user.id, input.reason);
    }),
});
