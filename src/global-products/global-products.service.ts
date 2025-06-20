import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalProduct } from '@prisma/client';

@Injectable()
export class GlobalProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<GlobalProduct[]> {
    return this.prisma.globalProduct.findMany();
  }

  async findOne(product_id: number): Promise<GlobalProduct | null> {
    return this.prisma.globalProduct.findUnique({ where: { product_id } });
  }

  async create(data: Omit<GlobalProduct, 'product_id' | 'created_at' | 'updated_at'>): Promise<GlobalProduct> {
    return this.prisma.globalProduct.create({ data });
  }

  async update(product_id: number, data: Partial<Omit<GlobalProduct, 'product_id' | 'created_at' | 'updated_at'>>): Promise<GlobalProduct> {
    return this.prisma.globalProduct.update({
      where: { product_id },
      data,
    });
  }

  async delete(product_id: number): Promise<GlobalProduct> {
    return this.prisma.globalProduct.delete({ where: { product_id } });
  }
}