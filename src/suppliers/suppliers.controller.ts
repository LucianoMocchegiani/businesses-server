import { Controller, Get, Post, Put, Delete, Param, Body, Req } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { Request } from 'express';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll(@Req() req: Request) {
    if (!req.businessId) {
      throw new Error('Business ID is required');
    }
    return this.suppliersService.findAll(req.businessId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.suppliersService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: any) {
    return this.suppliersService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.suppliersService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.suppliersService.remove(Number(id));
  }
}