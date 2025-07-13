import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalProductsService } from './global-products.service';
import { GlobalProduct } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('global-products')
@Controller('global-products')
export class GlobalProductsController {
  constructor(private readonly globalProductsService: GlobalProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos globales' })
  @ApiResponse({ status: 200, description: 'Lista de productos globales' })
  async findAll(): Promise<GlobalProduct[]> {
    try {
      return await this.globalProductsService.findAll();
    } catch (error) {
      throw new HttpException(`Error al obtener los productos globales: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto global por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto global' })
  @ApiResponse({ status: 200, description: 'Producto global encontrado' })
  async findOne(@Param('id') id: string): Promise<GlobalProduct | null> {
    try {
      return await this.globalProductsService.findOne(Number(id));
    } catch (error) {
      throw new HttpException(`Error al obtener el producto global: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear un producto global' })
  @ApiBody({ description: 'Datos del producto global a crear' })
  @ApiResponse({ status: 201, description: 'Producto global creado' })
  async create(@Body() data: Omit<GlobalProduct, 'product_id' | 'created_at' | 'updated_at'>): Promise<GlobalProduct> {
    try {
      return await this.globalProductsService.create(data);
    } catch (error) {
      throw new HttpException(`Error al crear el producto global: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un producto global' })
  @ApiParam({ name: 'id', description: 'ID del producto global' })
  @ApiBody({ description: 'Datos a actualizar' })
  @ApiResponse({ status: 200, description: 'Producto global actualizado' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<GlobalProduct, 'product_id' | 'created_at' | 'updated_at'>>
  ): Promise<GlobalProduct> {
    try {
      return await this.globalProductsService.update(Number(id), data);
    } catch (error) {
      throw new HttpException(`Error al actualizar el producto global: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto global' })
  @ApiParam({ name: 'id', description: 'ID del producto global' })
  @ApiResponse({ status: 200, description: 'Producto global eliminado' })
  async delete(@Param('id') id: string): Promise<GlobalProduct> {
    try {
      return await this.globalProductsService.delete(Number(id));
    } catch (error) {
      throw new HttpException(`Error al eliminar el producto global: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}