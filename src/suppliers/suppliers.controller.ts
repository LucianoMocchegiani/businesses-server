import { Controller, Get, Post, Put, Delete, Param, Body, Query, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiHeader, ApiParam, ApiBody } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { GetSuppliersDto } from './dto/get-suppliers.dto';
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
  @ApiQuery({ name: 'orderBy', required: false, description: 'Campo de ordenamiento' })
  @ApiQuery({ name: 'orderDirection', required: false, description: 'Dirección de ordenamiento' })
  @ApiQuery({ name: 'name', required: false, description: 'Buscar por nombre' })
  @ApiQuery({ name: 'email', required: false, description: 'Buscar por email' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filtrar por activos', type: 'boolean' })
  @ApiResponse({
    status: 200,
    description: 'Lista de proveedores obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
        page: { type: 'number' },
        lastPage: { type: 'number' },
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
  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado' })
  async findOne(@Param('id') id: number) {
    try {
      return await this.suppliersService.findOne(Number(id));
    } catch (error) {
      throw new HttpException(`Error al obtener el proveedor: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo proveedor' })
  @ApiBody({ description: 'Datos del proveedor a crear' })
  @ApiResponse({ status: 201, description: 'Proveedor creado' })
  async create(@Body() data: any) {
    try {
      return await this.suppliersService.create(data);
    } catch (error) {
      throw new HttpException(`Error al crear el proveedor: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar proveedor' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  @ApiBody({ description: 'Datos a actualizar' })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado' })
  async update(@Param('id') id: number, @Body() data: any) {
    try {
      return await this.suppliersService.update(Number(id), data);
    } catch (error) {
      throw new HttpException(`Error al actualizar el proveedor: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar proveedor' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado' })
  async remove(@Param('id') id: number) {
    try {
      return await this.suppliersService.remove(Number(id));
    } catch (error) {
      throw new HttpException(`Error al eliminar el proveedor: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}