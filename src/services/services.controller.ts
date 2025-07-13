import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los servicios' })
  @ApiResponse({ status: 200, description: 'Lista de servicios' })
  async findAll(): Promise<Service[]> {
    try {
      return await this.servicesService.findAll();
    } catch (error) {
      throw new HttpException(`Error al obtener los servicios: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @ApiResponse({ status: 200, description: 'Servicio encontrado' })
  async findOne(@Param('id') id: string): Promise<Service | null> {
    try {
      return await this.servicesService.findOne(Number(id));
    } catch (error) {
      throw new HttpException(`Error al obtener el servicio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear un servicio' })
  @ApiBody({ description: 'Datos del servicio a crear' })
  @ApiResponse({ status: 201, description: 'Servicio creado' })
  async create(@Body() data: Omit<Service, 'service_id' | 'created_at' | 'updated_at'>): Promise<Service> {
    try {
      return await this.servicesService.create(data);
    } catch (error) {
      throw new HttpException(`Error al crear el servicio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un servicio' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @ApiBody({ description: 'Datos a actualizar' })
  @ApiResponse({ status: 200, description: 'Servicio actualizado' })
  async update(@Param('id') id: string, @Body() data: Partial<Omit<Service, 'service_id' | 'created_at' | 'updated_at'>>): Promise<Service> {
    try {
      return await this.servicesService.update(Number(id), data);
    } catch (error) {
      throw new HttpException(`Error al actualizar el servicio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un servicio' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @ApiResponse({ status: 200, description: 'Servicio eliminado' })
  async delete(@Param('id') id: string): Promise<Service> {
    try {
      return await this.servicesService.delete(Number(id));
    } catch (error) {
      throw new HttpException(`Error al eliminar el servicio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}
