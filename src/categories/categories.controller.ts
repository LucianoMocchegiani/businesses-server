import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from '@prisma/client';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Category | null> {
    return this.categoriesService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: Omit<Category, 'category_id' | 'created_at' | 'updated_at'>): Promise<Category> {
    return this.categoriesService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<Category, 'category_id' | 'created_at' | 'updated_at'>>
  ): Promise<Category> {
    return this.categoriesService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.delete(Number(id));
  }
}