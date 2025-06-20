import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: number) {
    return this.prisma.customer.findMany({ where: { business_id: businessId } });
  }

  async findOne(customerId: number) {
    return this.prisma.customer.findUnique({ where: { customer_id: customerId } });
  }

  async create(data: any) {
    return this.prisma.customer.create({
      data: { ...data },
    });
  }

  async update(customerId: number, data: any) {
    return this.prisma.customer.update({
      where: { customer_id: customerId },
      data,
    });
  }

  async remove(customerId: number) {
    return this.prisma.customer.delete({ where: { customer_id: customerId } });
  }
}