import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetSuppliersDto } from './dto/get-suppliers.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { BusinessHeaders } from '../common/types';

export interface SuppliersResponse {
  data: any[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(headers: BusinessHeaders, dto: GetSuppliersDto): Promise<SuppliersResponse> {
    const businessId = parseInt(headers['x-business-id']);
    const { page = 1, limit = 10, order_by = 'created_at', order_direction = 'desc', supplier_name, contact_email } = dto;

    // Build where clause
    const where: any = { business_id: businessId };
    
    if (supplier_name) {
      where.supplier_name = { contains: supplier_name, mode: 'insensitive' };
    }
    
    if (contact_email) {
      where.contact_email = { contains: contact_email, mode: 'insensitive' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.supplier.count({ where });

    // Get paginated data
    const data = await this.prisma.supplier.findMany({
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

  async findOne(supplierId: number) {
    return this.prisma.supplier.findUnique({
      where: { supplier_id: supplierId },
    });
  }

  async create(data: CreateSupplierDto, headers: BusinessHeaders) {
    
    return this.prisma.supplier.create({
      data: {
        ...data,
        business_id: headers.business_id,
      },
    });
  }

  async update(supplierId: number, data: UpdateSupplierDto) {
    return this.prisma.supplier.update({
      where: { supplier_id: supplierId },
      data,
    });
  }

  async remove(supplierId: number) {
    return this.prisma.supplier.delete({
      where: { supplier_id: supplierId },
    });
  }
}