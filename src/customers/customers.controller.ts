import { Controller, Get, Post, Body, Patch, Put, Param, Delete, Query, HttpException, HttpStatus, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { GetCustomersDto } from './dto/get-customers.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
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
  @ApiQuery({ name: 'order_by', required: false, description: 'Campo de ordenamiento' })
  @ApiQuery({ name: 'order_direction', required: false, description: 'Dirección de ordenamiento' })
  @ApiQuery({ name: 'customer_name', required: false, description: 'Buscar por nombre' })
  @ApiQuery({ name: 'contact_email', required: false, description: 'Buscar por email' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes obtenida exitosamente',
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
  async findAll(@Query() query: GetCustomersDto, @Headers() headers: BusinessHeaders) {
    try {
      return await this.customersService.findAll(headers, query);
    } catch (error) {
      throw new HttpException(`Error al obtener los clientes: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async findOne(@Param('id') id: number) {
    try {
      const customer = await this.customersService.findOne(id);
      if (!customer) {
        throw new HttpException('Cliente no encontrado', HttpStatus.NOT_FOUND);
      }
      return customer;
    } catch (error) {
      throw new HttpException(`Error al obtener el cliente: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiHeader({
    name: 'x-business-id',
    description: 'ID del negocio',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
  async create(@Body() data: CreateCustomerDto, @Headers() headers: BusinessHeaders) {
    try {
      return await this.customersService.create(data, headers);
    } catch (error) {
      throw new HttpException(`Error al crear el cliente: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado exitosamente' })
  async update(@Param('id') id: number, @Body() data: UpdateCustomerDto) {
    try {
      return await this.customersService.update(id, data);
    } catch (error) {
      throw new HttpException(`Error al actualizar el cliente: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado exitosamente' })
  async remove(@Param('id') id: number) {
    try {
      return await this.customersService.remove(id);
    } catch (error) {
      throw new HttpException(`Error al eliminar el cliente: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}