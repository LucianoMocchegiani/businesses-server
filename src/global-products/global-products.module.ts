import { Module } from '@nestjs/common';
import { GlobalProductsService } from './global-products.service';
import { GlobalProductsController } from './global-products.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GlobalProductsController],
  providers: [GlobalProductsService],
  exports: [GlobalProductsService],
})
export class GlobalProductsModule {}