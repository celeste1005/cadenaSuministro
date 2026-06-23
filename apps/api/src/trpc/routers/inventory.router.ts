import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Action } from '../../modules/auth/casl-ability.factory';
import { TRPCError } from '@trpc/server';

const movementSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER']),
  quantity: z.number().positive(),
  unitCost: z.number().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const physicalInventorySchema = z.object({
  warehouseId: z.string().uuid(),
  productId: z.string().uuid(),
  systemQuantity: z.number(),
  physicalQuantity: z.number(),
  countedById: z.string().uuid(),
  notes: z.string().optional(),
});

export const inventoryRouter = router({
  // Obtener productos
  getProducts: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.inventoryService.getProducts(ctx.user.companyId);
    }),

  // Obtener bodegas
  getWarehouses: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.warehousingService.getWarehouses(ctx.user.companyId);
    }),

  // Obtener máquinas
  getMachines: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.inventoryService.getMachines(ctx.user.companyId);
    }),

  // Obtener movimientos
  getMovements: protectedProcedure
    .input(z.object({
      productId: z.string().uuid().optional(),
      warehouseId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.inventoryService.getMovements(ctx.user.companyId, input);
    }),

  // Crear movimiento
  createMovement: protectedProcedure
    .input(movementSchema)
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      
      if (!ability.can(Action.Create, 'InventoryMovement')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para registrar movimientos de inventario',
        });
      }

      return ctx.inventoryService.createMovement(ctx.user.companyId, input);
    }),

  // Crear auditoría física
  createPhysicalInventory: protectedProcedure
    .input(physicalInventorySchema)
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      
      if (!ability.can(Action.Create, 'PhysicalInventory')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para registrar auditorías de inventario',
        });
      }

      return ctx.inventoryService.createPhysicalInventory(ctx.user.companyId, input);
    }),

  // Obtener auditorías físicas
  getPhysicalInventories: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.inventoryService.getPhysicalInventories(ctx.user.companyId);
    }),
});
