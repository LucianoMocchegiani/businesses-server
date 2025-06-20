import { Module } from '@nestjs/common';
import { BusinessProductsService } from './business-products.service';
import { BusinessProductsController } from './business-products.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessProductsController],
  providers: [BusinessProductsService],
  exports: [BusinessProductsService],
})
export class BusinessProductsModule {}