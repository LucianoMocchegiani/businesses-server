import { Controller, Get, Param, Delete, Query, Post, Put, Body, Req, HttpException, HttpStatus, Headers, UsePipes, ValidationPipe } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { GetPurchasesDto } from './dto/get-purchases.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiHeader } from '@nestjs/swagger';

@ApiTags('purchases')
@Controller('purchases')
@UsePipes(new ValidationPipe({ transform: true }))
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener compras paginadas y filtradas' })
  @ApiResponse({ status: 200, description: 'Lista de compras' })
  async getPurchases(@Query() query: GetPurchasesDto, @Headers('x-business-id') businessId: string) {
    try {
      // Pasar headers al servicio
      return await this.purchasesService.getPurchasesByBusiness(query, { business_id: parseInt(businessId) });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Error al obtener las compras: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una compra por ID' })
  @ApiParam({ name: 'id', description: 'ID de la compra' })
  @ApiResponse({ status: 200, description: 'Compra encontrada' })
  async getPurchase(@Param('id') id: number) {
    try {
      return await this.purchasesService.getPurchaseById(id);
    } catch (error) {
      throw new HttpException(`Error al obtener la compra: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear una compra / Añade o actualiza inventarios' })
  @ApiHeader({ name: 'x-business-id', description: 'ID del negocio', required: true })
  @ApiBody({ type: CreatePurchaseDto })
  @ApiResponse({ status: 201, description: 'Compra creada' })
  async createPurchase(
    @Body() data: CreatePurchaseDto, 
    @Headers('x-business-id') businessId: string
  ) {
    try {
      return await this.purchasesService.createPurchase(data, { business_id: parseInt(businessId) });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Error al crear la compra: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una compra' })
  @ApiHeader({ name: 'x-business-id', description: 'ID del negocio', required: true })
  @ApiParam({ name: 'id', description: 'ID de la compra a actualizar' })
  @ApiBody({ type: UpdatePurchaseDto })
  @ApiResponse({ status: 200, description: 'Compra actualizada' })
  async updatePurchase(
    @Param('id') id: number,
    @Body() data: UpdatePurchaseDto, 
    @Headers('x-business-id') businessId: string
  ) {
    try {
      return await this.purchasesService.updatePurchase(id, data, { business_id: parseInt(businessId) });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Error al actualizar la compra: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar una compra' })
  @ApiParam({ name: 'id', description: 'ID de la compra a cancelar' })
  @ApiResponse({ status: 200, description: 'Compra cancelada' })
  async deletePurchase(@Param('id') id: number) {
    try {
      return await this.purchasesService.cancelPurchase(id);
    } catch (error) {
      throw new HttpException(`Error al cancelar la compra: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}