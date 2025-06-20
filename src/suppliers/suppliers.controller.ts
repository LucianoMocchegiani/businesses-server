import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll(@Query('business_id') business_id: number) {
    return this.suppliersService.findAll(Number(business_id));
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