import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { transformPrismaArrayResponse } from '../common/utils/dateUtils';

interface InventoryResponse {
  inventory_id: number;
  business_id: number;
  business_product_id?: number | null;
  global_product_id?: number | null;
  stock_quantity_total: number;
  created_at: number;
  updated_at: number;
  lots: LotResponse[];
  prices: InventoryPriceResponse[];
}

interface LotResponse {
  lot_id: number;
  inventory_id: number;
  lot_number?: string | null;
  entry_date?: number | null;
  expiration_date?: number | null;
  stock_quantity: number;
}

interface InventoryPriceResponse {
  inventory_price_id: number;
  inventory_id: number;
  price_type: string;
  price: number;
  valid_from: number;
  valid_to?: number | null;
  created_at: number;
}

@Injectable()
export class InventoriesService {
  constructor(private prisma: PrismaService) {}

  async getInventoriesByBusiness(businessId: number): Promise<InventoryResponse[]> {
    const inventories = await this.prisma.inventory.findMany({
      where: { business_id: businessId },
      orderBy: { created_at: 'desc' },
      include: { lots: true, prices: true },
    });
    
    return inventories.map(inventory => ({
      inventory_id: inventory.inventory_id,
      business_id: inventory.business_id,
      business_product_id: inventory.business_product_id,
      global_product_id: inventory.global_product_id,
      stock_quantity_total: inventory.stock_quantity_total,
      created_at: Number(inventory.created_at),
      updated_at: Number(inventory.updated_at),
      lots: inventory.lots.map(lot => ({
        lot_id: lot.lot_id,
        inventory_id: lot.inventory_id,
        lot_number: lot.lot_number,
        entry_date: lot.entry_date ? Number(lot.entry_date) : null,
        expiration_date: lot.expiration_date ? Number(lot.expiration_date) : null,
        stock_quantity: lot.stock_quantity,
      })),
      prices: inventory.prices.map(price => ({
        inventory_price_id: price.inventory_price_id,
        inventory_id: price.inventory_id,
        price_type: price.price_type,
        price: Number(price.price),
        valid_from: Number(price.valid_from),
        valid_to: price.valid_to ? Number(price.valid_to) : null,
        created_at: Number(price.created_at),
      })),
    }));
  }

  async getInventoryById(id: number): Promise<InventoryResponse | null> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { inventory_id: id },
      include: { lots: true, prices: true },
    });
    
    if (!inventory) return null;
    
    return {
      inventory_id: inventory.inventory_id,
      business_id: inventory.business_id,
      business_product_id: inventory.business_product_id,
      global_product_id: inventory.global_product_id,
      stock_quantity_total: inventory.stock_quantity_total,
      created_at: Number(inventory.created_at),
      updated_at: Number(inventory.updated_at),
      lots: inventory.lots.map(lot => ({
        lot_id: lot.lot_id,
        inventory_id: lot.inventory_id,
        lot_number: lot.lot_number,
        entry_date: lot.entry_date ? Number(lot.entry_date) : null,
        expiration_date: lot.expiration_date ? Number(lot.expiration_date) : null,
        stock_quantity: lot.stock_quantity,
      })),
      prices: inventory.prices.map(price => ({
        inventory_price_id: price.inventory_price_id,
        inventory_id: price.inventory_id,
        price_type: price.price_type,
        price: Number(price.price),
        valid_from: Number(price.valid_from),
        valid_to: price.valid_to ? Number(price.valid_to) : null,
        created_at: Number(price.created_at),
      })),
    };
  }
} 