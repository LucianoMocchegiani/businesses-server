import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoriesService {
  constructor(private prisma: PrismaService) {}

  async getInventoriesByBusiness(businessId: number) {
    return this.prisma.inventory.findMany({
      where: { business_id: businessId },
      orderBy: { created_at: 'desc' },
      include: { lots: true, prices: true },
    });
  }

  async getInventoryById(id: number) {
    return this.prisma.inventory.findUnique({
      where: { inventory_id: id },
      include: { lots: true, prices: true },
    });
  }
}