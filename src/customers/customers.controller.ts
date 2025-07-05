import { Controller, Get, Post, Put, Delete, Param, Body, Req } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Request } from 'express';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Req() req: Request) {
    if (!req.businessId) {
      throw new Error('Business ID is required');
    }
    return this.customersService.findAll(req.businessId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.customersService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: any) {
    return this.customersService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.customersService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.customersService.remove(Number(id));
  }
}