import { Module } from '@nestjs/common';
import { InventoryPricesController } from './inventory-prices.controller';
import { InventoryPricesService } from './inventory-prices.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryPricesController],
  providers: [InventoryPricesService],
  exports: [InventoryPricesService],
})
export class InventoryPricesModule {} 