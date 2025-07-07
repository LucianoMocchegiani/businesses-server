import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetCustomersDto } from './dto/get-customers.dto';
import { BusinessHeaders } from '../common/types';

export interface CustomersResponse {
  data: any[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(headers: BusinessHeaders, dto: GetCustomersDto): Promise<CustomersResponse> {
    const businessId = parseInt(headers['x-business-id']);
    const { page = 1, limit = 10, orderBy = 'createdAt', orderDirection = 'desc', name, email } = dto;

    // Map frontend field names to Prisma field names
    const fieldMapping = {
      name: 'customer_name',
      email: 'contact_email',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };

    // Build where clause
    const where: any = { business_id: businessId };
    
    if (name) {
      where.customer_name = { contains: name, mode: 'insensitive' };
    }
    
    if (email) {
      where.contact_email = { contains: email, mode: 'insensitive' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.customer.count({ where });

    // Map orderBy field name
    const prismaOrderBy = fieldMapping[orderBy] || orderBy;

    // Get paginated data
    const data = await this.prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [prismaOrderBy]: orderDirection },
    });

    // Calculate last page
    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      lastPage,
    };
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