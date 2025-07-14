import { Controller, Get, Post, Body, Patch, Put, Param, Delete, Query, HttpException, HttpStatus, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { GetSuppliersDto } from './dto/get-suppliers.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { BusinessHeaders } from '../common/types';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los proveedores',
    description: 'Obtiene lista paginada de proveedores del negocio con filtros y ordenamiento'
  })
  @ApiHeader({
    name: 'x-business-id',
    description: 'ID del negocio',
    required: true,
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad por página', type: 'number' })
  @ApiQuery({ name: 'order_by', required: false, description: 'Campo de ordenamiento' })
  @ApiQuery({ name: 'order_direction', required: false, description: 'Dirección de ordenamiento' })
  @ApiQuery({ name: 'supplier_name', required: false, description: 'Buscar por nombre' })
  @ApiQuery({ name: 'contact_email', required: false, description: 'Buscar por email' })
  @ApiResponse({
    status: 200,
    description: 'Lista de proveedores obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
        page: { type: 'number' },
        last_page: { type: 'number' },
      },
    },
  })
  async findAll(@Query() query: GetSuppliersDto, @Headers() headers: BusinessHeaders) {
    try {
      return await this.suppliersService.findAll(headers, query);
    } catch (error) {
      throw new HttpException(`Error al obtener los proveedores: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiResponse({ status: 200, description: 'Proveedor obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  async findOne(@Param('id') id: number) {
    try {
      const supplier = await this.suppliersService.findOne(id);
      if (!supplier) {
        throw new HttpException('Proveedor no encontrado', HttpStatus.NOT_FOUND);
      }
      return supplier;
    } catch (error) {
      throw new HttpException(`Error al obtener el proveedor: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ApiHeader({
    name: 'x-business-id',
    description: 'ID del negocio',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Proveedor creado exitosamente' })
  async create(@Body() data: CreateSupplierDto, @Headers() headers: BusinessHeaders) {
    try {
      return await this.suppliersService.create(data, headers);
    } catch (error) {
      throw new HttpException(`Error al crear el proveedor: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado exitosamente' })
  async update(@Param('id') id: number, @Body() data: UpdateSupplierDto) {
    try {
      return await this.suppliersService.update(id, data);
    } catch (error) {
      throw new HttpException(`Error al actualizar el proveedor: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado exitosamente' })
  async remove(@Param('id') id: number) {
    try {
      return await this.suppliersService.remove(id);
    } catch (error) {
      throw new HttpException(`Error al eliminar el proveedor: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}