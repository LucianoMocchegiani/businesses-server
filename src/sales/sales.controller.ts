import { Controller, Get, Param, Delete, Post, Body, Query, Req } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { GetSalesDto } from './dto/get-sales.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) { }

  @Get()
  @ApiOperation({ summary: 'Obtener ventas paginadas y filtradas' })
  @ApiResponse({ status: 200, description: 'Lista de ventas' })
  async getSales(@Query() query: GetSalesDto, @Req() req: Request) {
    if (!req.businessId) {
      throw new Error('Business ID is required');
    }
    // Agregar business_id al query
    const queryWithBusiness = { ...query, business_id: req.businessId };
    return this.salesService.getSalesByBusiness(queryWithBusiness);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @ApiParam({ name: 'id', description: 'ID de la venta' })
  @ApiResponse({ status: 200, description: 'Venta encontrada' })
  async getSale(@Param('id') id: number) {
    return this.salesService.getSaleById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una venta' })
  @ApiBody({ type: CreateSaleDto })
  @ApiResponse({ status: 201, description: 'Venta creada' })
  async createSale(@Body() data: CreateSaleDto) {
    return this.salesService.createSale(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar una venta' })
  @ApiParam({ name: 'id', description: 'ID de la venta a cancelar' })
  @ApiResponse({ status: 200, description: 'Venta cancelada' })
  async deleteSale(@Param('id') id: number) {
    return this.salesService.cancelSale(id);
  }
}