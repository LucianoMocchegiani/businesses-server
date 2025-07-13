import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Brand } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las marcas' })
  @ApiResponse({ status: 200, description: 'Lista de marcas' })
  async findAll(): Promise<Brand[]> {
    try {
      return await this.brandsService.findAll();
    } catch (error) {
      throw new HttpException(`Error al obtener las marcas: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una marca por ID' })
  @ApiParam({ name: 'id', description: 'ID de la marca' })
  @ApiResponse({ status: 200, description: 'Marca encontrada' })
  async findOne(@Param('id') id: string): Promise<Brand | null> {
    try {
      return await this.brandsService.findOne(Number(id));
    } catch (error) {
      throw new HttpException(`Error al obtener la marca: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear una marca' })
  @ApiBody({ description: 'Datos de la marca a crear' })
  @ApiResponse({ status: 201, description: 'Marca creada' })
  async create(@Body() data: Omit<Brand, 'brand_id' | 'created_at' | 'updated_at'>): Promise<Brand> {
    try {
      return await this.brandsService.create(data);
    } catch (error) {
      throw new HttpException(`Error al crear la marca: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una marca' })
  @ApiParam({ name: 'id', description: 'ID de la marca' })
  @ApiBody({ description: 'Datos a actualizar' })
  @ApiResponse({ status: 200, description: 'Marca actualizada' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<Brand, 'brand_id' | 'created_at' | 'updated_at'>>
  ): Promise<Brand> {
    try {
      return await this.brandsService.update(Number(id), data);
    } catch (error) {
      throw new HttpException(`Error al actualizar la marca: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una marca' })
  @ApiParam({ name: 'id', description: 'ID de la marca' })
  @ApiResponse({ status: 200, description: 'Marca eliminada' })
  async delete(@Param('id') id: string): Promise<Brand> {
    try {
      return await this.brandsService.delete(Number(id));
    } catch (error) {
      throw new HttpException(`Error al eliminar la marca: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}