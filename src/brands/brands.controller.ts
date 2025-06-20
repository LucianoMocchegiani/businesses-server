import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Brand } from '@prisma/client';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  findAll(): Promise<Brand[]> {
    return this.brandsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Brand | null> {
    return this.brandsService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: Omit<Brand, 'brand_id' | 'created_at' | 'updated_at'>): Promise<Brand> {
    return this.brandsService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<Brand, 'brand_id' | 'created_at' | 'updated_at'>>
  ): Promise<Brand> {
    return this.brandsService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Brand> {
    return this.brandsService.delete(Number(id));
  }
}