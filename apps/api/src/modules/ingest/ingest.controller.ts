import { Controller, Post, Body, UseGuards } from '@nestjs/common'; 
 import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; 
 import { RolesGuard } from '../../common/guards/roles.guard'; 
 import { Roles } from '../../common/decorators/roles.decorator'; 
 import { IngestService } from './ingest.service'; 
 
 @Controller('ingest') 
 @UseGuards(JwtAuthGuard, RolesGuard) 
 export class IngestController { 
   constructor(private ingestService: IngestService) {} 
 
   @Post('purchase-orders') 
   @Roles('admin', 'purchasing_manager') 
   async ingestPurchaseOrders(@Body() data: { 
     orders: any[]; 
     source: string; // 'csv', 'api', 'erp-webhook' 
   }) { 
     return this.ingestService.processPurchaseOrders(data.orders, data.source); 
   } 
 
   @Post('sales') 
   @Roles('admin', 'general_manager') 
   async ingestSales(@Body() data: { 
     sales: any[]; 
     source: string; 
   }) { 
     return this.ingestService.processSales(data.sales, data.source); 
   } 
 
   @Post('inventory') 
   @Roles('admin', 'operations_manager') 
   async ingestInventory(@Body() data: { 
     movements: any[]; 
     source: string; 
   }) { 
     return this.ingestService.processInventoryMovements(data.movements, data.source); 
   } 
 } 
