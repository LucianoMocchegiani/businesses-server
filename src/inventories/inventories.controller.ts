import { Controller, Get, Post, Put, Delete, Param, Body, Req } from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { Request } from 'express';

@Controller('inventories')
export class InventoriesController {
  constructor(private inventoriesService: InventoriesService) {}

  @Get()
  async getInventories(@Req() req: Request) {
    if (!req.businessId) {
      throw new Error('Business ID is required');
    }
    return this.inventoriesService.getInventoriesByBusiness(req.businessId);
  }

  @Get(':id')
  async getInventory(@Param('id') id: number) {
    return this.inventoriesService.getInventoryById(Number(id));
  }
}