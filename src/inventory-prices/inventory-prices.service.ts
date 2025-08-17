import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryPrice, PriceType } from '@prisma/client';

export interface CreateInventoryPriceDto {
  inventory_id: number;
  price_type: PriceType;
  price: number;
  valid_from: number;
  valid_to?: number;
}

export interface UpdateInventoryPriceDto {
  price_type?: PriceType;
  price?: number;
  valid_from?: number;
  valid_to?: number;
}

@Injectable()
export class InventoryPricesService {
  constructor(private prisma: PrismaService) {}

  async createPrice(data: CreateInventoryPriceDto): Promise<InventoryPrice> {
    // Validar que el inventario existe
    const inventory = await this.prisma.inventory.findUnique({
      where: { inventory_id: data.inventory_id }
    });

    if (!inventory) {
      throw new Error(`El inventario con ID ${data.inventory_id} no existe`);
    }

    const price = await this.prisma.inventoryPrice.create({
      data: {
        inventory_id: data.inventory_id,
        price_type: data.price_type,
        price: data.price,
        valid_from: data.valid_from,
        valid_to: data.valid_to ? data.valid_to : null,
      },
    });

    return {
      inventory_price_id: price.inventory_price_id,
      inventory_id: price.inventory_id,
      price_type: price.price_type,
      price: price.price,
      valid_from: price.valid_from,
      valid_to: price.valid_to,
      created_at: price.created_at,
    };
  }

  async updatePrice(priceId: number, data: UpdateInventoryPriceDto): Promise<InventoryPrice> {
    const price = await this.prisma.inventoryPrice.update({
      where: { inventory_price_id: priceId },
      data: {
        price_type: data.price_type,
        price: data.price,
        valid_from: data.valid_from ? data.valid_from : undefined,
        valid_to: data.valid_to ? data.valid_to : undefined,
      },
    });

    return {
      inventory_price_id: price.inventory_price_id,
      inventory_id: price.inventory_id,
      price_type: price.price_type,
      price: price.price,
      valid_from: price.valid_from,
      valid_to: price.valid_to,
      created_at: price.created_at,
    };
  }

  async deletePrice(priceId: number): Promise<InventoryPrice> {
    const price = await this.prisma.inventoryPrice.delete({
      where: { inventory_price_id: priceId },
    });

    return {
      inventory_price_id: price.inventory_price_id,
      inventory_id: price.inventory_id,
      price_type: price.price_type,
      price: price.price,
      valid_from: price.valid_from,
      valid_to: price.valid_to,
      created_at: price.created_at,
    };
  }
} 