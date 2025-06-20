import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { Business } from '@prisma/client';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get()
  findAll(@Param('user_id') user_id: number): Promise<Business[]> {
    return this.businessesService.findAll(user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Business | null> {
    return this.businessesService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: Omit<Business, 'business_id' | 'created_at' | 'updated_at'>): Promise<Business> {
    return this.businessesService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<Business, 'business_id' | 'created_at' | 'updated_at'>>
  ): Promise<Business> {
    return this.businessesService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Business> {
    return this.businessesService.delete(Number(id));
  }
}