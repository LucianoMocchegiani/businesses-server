import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from '@prisma/client';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(): Promise<Service[]> {
    return this.servicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Service | null> {
    return this.servicesService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: Omit<Service, 'service_id' | 'created_at' | 'updated_at'>): Promise<Service> {
    return this.servicesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Omit<Service, 'service_id' | 'created_at' | 'updated_at'>>): Promise<Service> {
    return this.servicesService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Service> {
    return this.servicesService.delete(Number(id));
  }
}
