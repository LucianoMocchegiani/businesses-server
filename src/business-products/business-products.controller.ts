import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { BusinessProductsService } from './business-products.service';
import { BusinessProduct } from '@prisma/client';

@Controller('business-products')
export class BusinessProductsController {
  constructor(private readonly businessProductsService: BusinessProductsService) {}

  @Get()
  findAll(): Promise<BusinessProduct[]> {
    return this.businessProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<BusinessProduct | null> {
    return this.businessProductsService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: Omit<BusinessProduct, 'business_product_id' | 'created_at' | 'updated_at'>): Promise<BusinessProduct> {
    return this.businessProductsService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<BusinessProduct, 'business_product_id' | 'created_at' | 'updated_at'>>
  ): Promise<BusinessProduct> {
    return this.businessProductsService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<BusinessProduct> {
    return this.businessProductsService.delete(Number(id));
  }
}