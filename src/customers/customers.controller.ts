import { Controller, Get, Post, Put, Delete, Param, Body, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { GetCustomersDto } from './dto/get-customers.dto';
import { BusinessHeaders } from '../common/types';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los clientes',
    description: 'Obtiene lista paginada de clientes del negocio con filtros y ordenamiento'
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
    description: 'Lista de clientes obtenida exitosamente',
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
  findAll(@Query() query: GetCustomersDto, @Headers() headers: BusinessHeaders) {
    return this.customersService.findAll(headers, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  findOne(@Param('id') id: number) {
    return this.customersService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo cliente' })
  create(@Body() data: any) {
    return this.customersService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar cliente' })
  update(@Param('id') id: number, @Body() data: any) {
    return this.customersService.update(Number(id), data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cliente' })
  remove(@Param('id') id: number) {
    return this.customersService.remove(Number(id));
  }
}