import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessProduct } from '@prisma/client';

@Injectable()
export class BusinessProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<BusinessProduct[]> {
    return this.prisma.businessProduct.findMany();
  }

  async findOne(business_product_id: number): Promise<BusinessProduct | null> {
    return this.prisma.businessProduct.findUnique({ where: { business_product_id } });
  }

  async create(data: Omit<BusinessProduct, 'business_product_id' | 'created_at' | 'updated_at'>): Promise<BusinessProduct> {
    return this.prisma.businessProduct.create({ data });
  }

  async update(
    business_product_id: number,
    data: Partial<Omit<BusinessProduct, 'business_product_id' | 'created_at' | 'updated_at'>>
  ): Promise<BusinessProduct> {
    return this.prisma.businessProduct.update({
      where: { business_product_id },
      data,
    });
  }

  async delete(business_product_id: number): Promise<BusinessProduct> {
    return this.prisma.businessProduct.delete({ where: { business_product_id } });
  }
}