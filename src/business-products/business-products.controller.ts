import { Controller, Get, Post, Put, Delete, Param, Body, Req, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { BusinessProductsService } from './business-products.service';
import { BusinessProduct } from '@prisma/client';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiHeader } from '@nestjs/swagger';

@ApiTags('business-products')
@Controller('business-products')
export class BusinessProductsController {
  constructor(private readonly businessProductsService: BusinessProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos del negocio' })
  @ApiResponse({ status: 200, description: 'Lista de productos del negocio' })
  async findAll(@Req() req: Request): Promise<BusinessProduct[]> {
    try {
      if (!req.businessId) {
        throw new HttpException('Business ID es requerido', HttpStatus.BAD_REQUEST);
      }
      return await this.businessProductsService.findAllByBusiness(req.businessId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Error al obtener los productos del negocio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto del negocio por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto del negocio' })
  @ApiResponse({ status: 200, description: 'Producto del negocio encontrado' })
  async findOne(@Param('id') id: string): Promise<BusinessProduct | null> {
    try {
      return await this.businessProductsService.findOne(Number(id));
    } catch (error) {
      throw new HttpException(`Error al obtener el producto del negocio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear un producto del negocio' })
  @ApiHeader({ name: 'x-business-id', description: 'ID del negocio', required: true })
  @ApiBody({ description: 'Datos del producto del negocio a crear' })
  @ApiResponse({ status: 201, description: 'Producto del negocio creado' })
  async create(
    @Body() data: any,
    @Headers('x-business-id') businessId: string
  ): Promise<BusinessProduct> {
    try {
      // Mapear los campos del frontend a los del modelo BusinessProduct
      const businessProductData = {
        business_id: parseInt(businessId),
        product_name: data.name || data.product_name,
        product_description: data.description || data.product_description,
        product_code: data.code || data.product_code,
        creator_id: data.creator_id || null
      };

      return await this.businessProductsService.create(businessProductData);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Error al crear el producto del negocio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un producto del negocio' })
  @ApiParam({ name: 'id', description: 'ID del producto del negocio' })
  @ApiHeader({ name: 'x-business-id', description: 'ID del negocio', required: true })
  @ApiBody({ description: 'Datos a actualizar' })
  @ApiResponse({ status: 200, description: 'Producto del negocio actualizado' })
  async update(
    @Param('id') id: string,
    @Body() data: any,
    @Headers('x-business-id') businessId: string
  ): Promise<BusinessProduct> {
    try {
      if (!businessId) {
        throw new HttpException('x-business-id header es requerido', HttpStatus.BAD_REQUEST);
      }

      // Mapear los campos del frontend a los del modelo BusinessProduct
      const businessProductData: any = {};
      
      if (data.name || data.product_name) {
        businessProductData.product_name = data.name || data.product_name;
      }
      if (data.description || data.product_description) {
        businessProductData.product_description = data.description || data.product_description;
      }
      if (data.code || data.product_code) {
        businessProductData.product_code = data.code || data.product_code;
      }
      if (data.creator_id !== undefined) {
        businessProductData.creator_id = data.creator_id;
      }

      return await this.businessProductsService.update(Number(id), businessProductData);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Error al actualizar el producto del negocio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto del negocio' })
  @ApiParam({ name: 'id', description: 'ID del producto del negocio' })
  @ApiResponse({ status: 200, description: 'Producto del negocio eliminado' })
  async delete(@Param('id') id: string): Promise<BusinessProduct> {
    try {
      return await this.businessProductsService.delete(Number(id));
    } catch (error) {
      throw new HttpException(`Error al eliminar el producto del negocio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}