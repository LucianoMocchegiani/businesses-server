import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { GlobalProductsService } from './global-products.service';
import { GlobalProduct } from '@prisma/client';

@Controller('global-products')
export class GlobalProductsController {
  constructor(private readonly globalProductsService: GlobalProductsService) {}

  @Get()
  findAll(): Promise<GlobalProduct[]> {
    return this.globalProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<GlobalProduct | null> {
    return this.globalProductsService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: Omit<GlobalProduct, 'product_id' | 'created_at' | 'updated_at'>): Promise<GlobalProduct> {
    return this.globalProductsService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<GlobalProduct, 'product_id' | 'created_at' | 'updated_at'>>
  ): Promise<GlobalProduct> {
    return this.globalProductsService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<GlobalProduct> {
    return this.globalProductsService.delete(Number(id));
  }
}