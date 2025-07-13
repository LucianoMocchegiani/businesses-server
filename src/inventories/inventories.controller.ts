import { Controller, Get, Post, Put, Delete, Param, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('inventories')
@Controller('inventories')
export class InventoriesController {
  constructor(private inventoriesService: InventoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los inventarios' })
  @ApiResponse({ status: 200, description: 'Lista de inventarios' })
  async getInventories(@Req() req: Request) {
    try {
      if (!req.businessId) {
        throw new HttpException('Business ID es requerido', HttpStatus.BAD_REQUEST);
      }
      return await this.inventoriesService.getInventoriesByBusiness(req.businessId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Error al obtener los inventarios: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un inventario por ID' })
  @ApiParam({ name: 'id', description: 'ID del inventario' })
  @ApiResponse({ status: 200, description: 'Inventario encontrado' })
  async getInventory(@Param('id') id: number) {
    try {
      return await this.inventoriesService.getInventoryById(Number(id));
    } catch (error) {
      throw new HttpException(`Error al obtener el inventario: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}