import { Controller, Get, Post, Put, Delete, Param, Body, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiHeader } from '@nestjs/swagger';
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
  findAll(@Query() query: GetSuppliersDto, @Headers() headers: BusinessHeaders) {
    return this.suppliersService.findAll(headers, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  findOne(@Param('id') id: number) {
    return this.suppliersService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo proveedor' })
  create(@Body() data: any) {
    return this.suppliersService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar proveedor' })
  update(@Param('id') id: number, @Body() data: any) {
    return this.suppliersService.update(Number(id), data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar proveedor' })
  remove(@Param('id') id: number) {
    return this.suppliersService.remove(Number(id));
  }
}