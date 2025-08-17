import { Controller, Post, Delete, Body, Param, Headers, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { InventoryPricesService, CreateInventoryPriceDto } from './inventory-prices.service';
import { BusinessHeaders } from '../common/types/headers.types';

@ApiTags('inventory-prices')
@ApiBearerAuth()
@ApiSecurity('business-id')
@ApiSecurity('profile-id')
@Controller('inventory-prices')
export class InventoryPricesController {
  constructor(private readonly inventoryPricesService: InventoryPricesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo precio de inventario' })
  @ApiResponse({ status: 201, description: 'Precio creado exitosamente' })
  async create(@Body() data: CreateInventoryPriceDto, @Headers() headers: BusinessHeaders) {
    return this.inventoryPricesService.createPrice(data);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un precio de inventario' })
  @ApiResponse({ status: 200, description: 'Precio eliminado exitosamente' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Headers() headers: BusinessHeaders
  ) {
    return this.inventoryPricesService.deletePrice(id);
  }
} 