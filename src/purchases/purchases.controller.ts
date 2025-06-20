import { Controller, Get, Param, Delete, Query, Post, Body } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { GetPurchasesDto } from './dto/get-purchases.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener compras paginadas y filtradas' })
  @ApiResponse({ status: 200, description: 'Lista de compras' })
  async getPurchases(@Query() query: GetPurchasesDto) {
    return this.purchasesService.getPurchasesByBusiness(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una compra por ID' })
  @ApiParam({ name: 'id', description: 'ID de la compra' })
  @ApiResponse({ status: 200, description: 'Compra encontrada' })
  async getPurchase(@Param('id') id: number) {
    return this.purchasesService.getPurchaseById(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Crear una compra / Añade o actualiza inventarios' })
  @ApiBody({ type: CreatePurchaseDto })
  @ApiResponse({ status: 201, description: 'Compra creada' })
  async createPurchase(@Body() data: CreatePurchaseDto) {
    return this.purchasesService.createPurchase(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar una compra' })
  @ApiParam({ name: 'id', description: 'ID de la compra a cancelar' })
  @ApiResponse({ status: 200, description: 'Compra cancelada' })
  async deletePurchase(@Param('id') id: number) {
    return this.purchasesService.cancelPurchase(Number(id));
  }
}