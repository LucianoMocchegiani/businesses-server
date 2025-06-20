import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { InventoriesService } from './inventories.service';

@Controller('inventories')
export class InventoriesController {
  constructor(private inventoriesService: InventoriesService) {}

  @Get('business/:business_id')
  async getInventoriesByBusiness(@Param('business_id') business_id: number) {
    return this.inventoriesService.getInventoriesByBusiness(Number(business_id));
  }

  @Get(':id')
  async getInventory(@Param('id') id: number) {
    return this.inventoriesService.getInventoryById(Number(id));
  }
}