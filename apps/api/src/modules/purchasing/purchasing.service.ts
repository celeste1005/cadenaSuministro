import { Injectable, Logger } from '@nestjs/common'; 
 import { PrismaService } from '../../prisma/prisma.service';
 import { PerfectReceiptsCalculator } from './calculators/perfect-receipts.calculator'; 
 import { SupplierCertificationCalculator } from './calculators/supplier-certification.calculator';
 import { OrderQualityCalculator } from './calculators/order-quality.calculator';
 import { PurchaseVolumeCalculator } from './calculators/purchase-volume.calculator';
 import { NotificationsService } from '../notifications/notifications.service';
 
 @Injectable() 
 export class PurchasingService { 
   private readonly logger = new Logger(PurchasingService.name);

   constructor( 
    private readonly prisma: PrismaService,
    private readonly perfectReceiptsCalculator: PerfectReceiptsCalculator, 
    private readonly supplierCertificationCalculator: SupplierCertificationCalculator,
    private readonly orderQualityCalculator: OrderQualityCalculator,
    private readonly purchaseVolumeCalculator: PurchaseVolumeCalculator,
    private readonly notificationsService: NotificationsService,
  ) {} 

   // --- KPIs ---
   async calculateSupplierCertification(companyId: string) {
     return this.supplierCertificationCalculator.calculate(companyId);
   }

   async calculateOrderQuality(companyId: string, startDate: Date, endDate: Date) {
     return this.orderQualityCalculator.calculate(companyId, startDate, endDate);
   }

   async calculatePurchaseVolume(companyId: string, startDate: Date, endDate: Date) {
     return this.purchaseVolumeCalculator.calculate(companyId, startDate, endDate);
   }

   // --- Suppliers CRUD ---
   async getSuppliers(companyId: string) {
     return this.prisma.supplier.findMany({
       where: { companyId, status: 'active' },
       orderBy: { name: 'asc' },
     });
   }

   async createSupplier(companyId: string, data: any) {
     return this.prisma.supplier.create({
       data: {
         ...data,
         companyId,
       },
     });
   }

   async updateSupplier(id: string, data: any) {
     return this.prisma.supplier.update({
       where: { id },
       data,
     });
   }

   // --- Purchase Orders CRUD ---
   async getPurchaseOrders(companyId: string, filters?: any) {
     return this.prisma.purchaseOrder.findMany({
       where: {
         companyId,
         ...(filters?.supplierId ? { supplierId: filters.supplierId } : {}),
         ...(filters?.status ? { status: filters.status } : {}),
       },
       include: {
         supplier: true,
         creator: { select: { fullName: true } },
       },
       orderBy: { createdAt: 'desc' },
     });
   }

   async createPurchaseOrder(companyId: string, userId: string, data: any) {
     const { lines, ...orderData } = data;
     
     return this.prisma.purchaseOrder.create({
       data: {
         ...orderData,
         companyId,
         createdBy: userId,
         status: 'pending',
         lines: {
           create: lines.map((line: any) => ({
             productId: line.productId,
             quantity: line.quantity,
             unitPrice: line.unitPrice,
             totalPrice: line.quantity * line.unitPrice,
           })),
         },
       },
       include: {
         lines: true,
       },
     });
   }

   async getPendingApprovals() {
     return this.prisma.purchaseOrder.findMany({
       where: { status: 'pending' },
       include: {
         supplier: true,
         creator: { select: { id: true, fullName: true, email: true } },
         lines: { include: { product: true } },
       },
       orderBy: { createdAt: 'desc' },
     });
   }

   async approveOrder(orderId: string, userId: string) {
     this.logger.log(`Approving order ${orderId} by user ${userId}`);
     const order = await this.prisma.purchaseOrder.update({
       where: { id: orderId },
       data: {
         status: 'approved',
         approvedBy: userId,
         updatedAt: new Date(),
       },
     });

     // Notificar al creador
     await this.notificationsService.notifyApproval(orderId, 'approved');
     
     return order;
   }

   async rejectOrder(orderId: string, userId: string, reason: string) {
     this.logger.log(`Rejecting order ${orderId} by user ${userId}. Reason: ${reason}`);
     const order = await this.prisma.purchaseOrder.update({
       where: { id: orderId },
       data: {
         status: 'rejected',
         approvedBy: userId,
         rejectionReason: reason,
         updatedAt: new Date(),
       },
     });

     // Notificar al creador
     await this.notificationsService.notifyApproval(orderId, 'rejected', reason);

     return order;
   }
 
   async calculatePerfectReceipts(input: { 
     companyId: string;
     startDate: Date; 
     endDate: Date; 
     supplierId?: string; 
   }) { 
     return this.perfectReceiptsCalculator.calculate(
       input.companyId,
       input.startDate, 
       input.endDate, 
       input.supplierId, 
     ); 
   } 
 
   async getPerfectReceiptsTimeSeries(input: { 
     companyId: string;
     startDate: Date; 
     endDate: Date; 
     supplierId?: string; 
   }) { 
     return this.perfectReceiptsCalculator.getTimeSeries(
       input.companyId,
       input.startDate, 
       input.endDate, 
       input.supplierId, 
     ); 
   } 
 } 
