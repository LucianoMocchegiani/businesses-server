import { Controller, Get, Post, Put, Delete, Param, Body, Req } from '@nestjs/common';
import { BusinessProductsService } from './business-products.service';
import { BusinessProduct } from '@prisma/client';
import { Request } from 'express';

@Controller('business-products')
export class BusinessProductsController {
  constructor(private readonly businessProductsService: BusinessProductsService) {}

  @Get()
  findAll(@Req() req: Request): Promise<BusinessProduct[]> {
    if (!req.businessId) {
      throw new Error('Business ID is required');
    }
    return this.businessProductsService.findAllByBusiness(req.businessId);
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