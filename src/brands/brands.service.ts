import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Brand } from '@prisma/client';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Brand[]> {
    return this.prisma.brand.findMany();
  }

  async findOne(brand_id: number): Promise<Brand | null> {
    return this.prisma.brand.findUnique({ where: { brand_id } });
  }

  async create(data: Omit<Brand, 'brand_id' | 'created_at' | 'updated_at'>): Promise<Brand> {
    return this.prisma.brand.create({ data });
  }

  async update(brand_id: number, data: Partial<Omit<Brand, 'brand_id' | 'created_at' | 'updated_at'>>): Promise<Brand> {
    return this.prisma.brand.update({
      where: { brand_id },
      data,
    });
  }

  async delete(brand_id: number): Promise<Brand> {
    return this.prisma.brand.delete({ where: { brand_id } });
  }
}