import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiResponse({ status: 200, description: 'Lista de categorías' })
  async findAll(): Promise<Category[]> {
    try {
      return await this.categoriesService.findAll();
    } catch (error) {
      throw new HttpException(`Error al obtener las categorías: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  @ApiResponse({ status: 200, description: 'Categoría encontrada' })
  async findOne(@Param('id') id: string): Promise<Category | null> {
    try {
      return await this.categoriesService.findOne(Number(id));
    } catch (error) {
      throw new HttpException(`Error al obtener la categoría: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear una categoría' })
  @ApiBody({ description: 'Datos de la categoría a crear' })
  @ApiResponse({ status: 201, description: 'Categoría creada' })
  async create(@Body() data: Omit<Category, 'category_id' | 'created_at' | 'updated_at'>): Promise<Category> {
    try {
      return await this.categoriesService.create(data);
    } catch (error) {
      throw new HttpException(`Error al crear la categoría: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  @ApiBody({ description: 'Datos a actualizar' })
  @ApiResponse({ status: 200, description: 'Categoría actualizada' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<Category, 'category_id' | 'created_at' | 'updated_at'>>
  ): Promise<Category> {
    try {
      return await this.categoriesService.update(Number(id), data);
    } catch (error) {
      throw new HttpException(`Error al actualizar la categoría: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una categoría' })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada' })
  async delete(@Param('id') id: string): Promise<Category> {
    try {
      return await this.categoriesService.delete(Number(id));
    } catch (error) {
      throw new HttpException(`Error al eliminar la categoría: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}