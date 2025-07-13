import { Controller, Get, Post, Put, Delete, Param, Body, Query, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiHeader, ApiParam, ApiBody } from '@nestjs/swagger';
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
  async findAll(@Query() query: GetCustomersDto, @Headers() headers: BusinessHeaders) {
    try {
      return await this.customersService.findAll(headers, query);
    } catch (error) {
      throw new HttpException(`Error al obtener los clientes: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  @ApiParam({ name: 'id', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  async findOne(@Param('id') id: number) {
    try {
      return await this.customersService.findOne(Number(id));
    } catch (error) {
      throw new HttpException(`Error al obtener el cliente: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo cliente' })
  @ApiBody({ description: 'Datos del cliente a crear' })
  @ApiResponse({ status: 201, description: 'Cliente creado' })
  async create(@Body() data: any) {
    try {
      return await this.customersService.create(data);
    } catch (error) {
      throw new HttpException(`Error al crear el cliente: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar cliente' })
  @ApiParam({ name: 'id', description: 'ID del cliente' })
  @ApiBody({ description: 'Datos a actualizar' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado' })
  async update(@Param('id') id: number, @Body() data: any) {
    try {
      return await this.customersService.update(Number(id), data);
    } catch (error) {
      throw new HttpException(`Error al actualizar el cliente: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cliente' })
  @ApiParam({ name: 'id', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado' })
  async remove(@Param('id') id: number) {
    try {
      return await this.customersService.remove(Number(id));
    } catch (error) {
      throw new HttpException(`Error al eliminar el cliente: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}