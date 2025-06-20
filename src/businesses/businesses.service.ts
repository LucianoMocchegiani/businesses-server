import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Business } from '@prisma/client';

@Injectable()
export class BusinessesService {
  constructor(private prisma: PrismaService) {}

  // traer todos los negocios de un usuario por user_id
  async findAll(user_id: number): Promise<Business[]> {
    return this.prisma.business.findMany({ where: { owner_id: user_id } });
  }

  async findOne(business_id: number): Promise<Business | null> {
    return this.prisma.business.findUnique({ where: { business_id } });
  }

  async create(data: Omit<Business, 'business_id' | 'created_at' | 'updated_at'>): Promise<Business> {
    return this.prisma.business.create({ data });
  }

  async update(business_id: number, data: Partial<Omit<Business, 'business_id' | 'created_at' | 'updated_at'>>): Promise<Business> {
    return this.prisma.business.update({
      where: { business_id },
      data,
    });
  }

  async delete(business_id: number): Promise<Business> {
    return this.prisma.business.delete({ where: { business_id } });
  }
}