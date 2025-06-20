import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: number) {
    return this.prisma.supplier.findMany({ where: { business_id: businessId } });
  }

  async findOne(supplierId: number) {
    return this.prisma.supplier.findUnique({ where: { supplier_id: supplierId } });
  }

  async create(data: any) {
    return this.prisma.supplier.create({
      data: { ...data },
    });
  }

  async update(supplierId: number, data: any) {
    return this.prisma.supplier.update({
      where: { supplier_id: supplierId },
      data,
    });
  }

  async remove(supplierId: number) {
    return this.prisma.supplier.delete({ where: { supplier_id: supplierId } });
  }
}