import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Param('business_id') business_id: number) {
    return this.customersService.findAll(Number(business_id));
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