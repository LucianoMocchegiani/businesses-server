import { Controller, Get, Post, Put, Delete, Param, Body, Req, Headers } from '@nestjs/common';
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
  create(
    @Body() data: any,
    @Headers('x-business-id') businessId: string
  ): Promise<BusinessProduct> {
    if (!businessId) {
      throw new Error('x-business-id header is required');
    }

    // Mapear los campos del frontend a los del modelo BusinessProduct
    const businessProductData = {
      business_id: parseInt(businessId),
      custom_name: data.name || data.custom_name,
      custom_description: data.description || data.custom_description,
      custom_code: data.code || data.custom_code,
      creator_id: data.creator_id || null
    };

    return this.businessProductsService.create(businessProductData);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: any,
    @Headers('x-business-id') businessId: string
  ): Promise<BusinessProduct> {
    if (!businessId) {
      throw new Error('x-business-id header is required');
    }

    // Mapear los campos del frontend a los del modelo BusinessProduct
    const businessProductData: any = {};
    
    if (data.name || data.custom_name) {
      businessProductData.custom_name = data.name || data.custom_name;
    }
    if (data.description || data.custom_description) {
      businessProductData.custom_description = data.description || data.custom_description;
    }
    if (data.code || data.custom_code) {
      businessProductData.custom_code = data.code || data.custom_code;
    }
    if (data.creator_id !== undefined) {
      businessProductData.creator_id = data.creator_id;
    }

    return this.businessProductsService.update(Number(id), businessProductData);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<BusinessProduct> {
    return this.businessProductsService.delete(Number(id));
  }
}