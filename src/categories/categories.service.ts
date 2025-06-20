import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }

  async findOne(category_id: number): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { category_id } });
  }

  async create(data: Omit<Category, 'category_id' | 'created_at' | 'updated_at'>): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  async update(category_id: number, data: Partial<Omit<Category, 'category_id' | 'created_at' | 'updated_at'>>): Promise<Category> {
    return this.prisma.category.update({
      where: { category_id },
      data,
    });
  }

  async delete(category_id: number): Promise<Category> {
    return this.prisma.category.delete({ where: { category_id } });
  }
}