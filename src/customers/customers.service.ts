import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetCustomersDto } from './dto/get-customers.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BusinessHeaders } from '../common/types';

export interface CustomersResponse {
  data: any[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(headers: BusinessHeaders, dto: GetCustomersDto): Promise<CustomersResponse> {
    const businessId = parseInt(headers['x-business-id']);
    const { page = 1, limit = 10, order_by = 'created_at', order_direction = 'desc', customer_name, contact_email } = dto;

    // Build where clause
    const where: any = { business_id: businessId };
    
    if (customer_name) {
      where.customer_name = { contains: customer_name, mode: 'insensitive' };
    }
    
    if (contact_email) {
      where.contact_email = { contains: contact_email, mode: 'insensitive' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.customer.count({ where });

    // Get paginated data
    const data = await this.prisma.customer.findMany({
      where,
      orderBy: { [order_by]: order_direction },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      last_page: Math.ceil(total / limit),
    };
  }

  async findOne(customerId: number) {
    return this.prisma.customer.findUnique({
      where: { customer_id: customerId },
    });
  }

  async create(data: CreateCustomerDto, headers: BusinessHeaders) {
    const businessId = parseInt(headers['x-business-id']);
    
    return this.prisma.customer.create({
      data: {
        ...data,
        business_id: businessId,
      },
    });
  }

  async update(customerId: number, data: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { customer_id: customerId },
      data,
    });
  }

  async remove(customerId: number) {
    return this.prisma.customer.delete({
      where: { customer_id: customerId },
    });
  }
}