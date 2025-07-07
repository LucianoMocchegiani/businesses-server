import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetSuppliersDto } from './dto/get-suppliers.dto';
import { BusinessHeaders } from '../common/types';

export interface SuppliersResponse {
  data: any[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(headers: BusinessHeaders, dto: GetSuppliersDto): Promise<SuppliersResponse> {
    const businessId = parseInt(headers['x-business-id']);
    const { page = 1, limit = 10, orderBy = 'createdAt', orderDirection = 'desc', name, email } = dto;

    // Map frontend field names to Prisma field names
    const fieldMapping = {
      name: 'supplier_name',
      email: 'contact_email',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };

    // Build where clause
    const where: any = { business_id: businessId };
    
    if (name) {
      where.supplier_name = { contains: name, mode: 'insensitive' };
    }
    
    if (email) {
      where.contact_email = { contains: email, mode: 'insensitive' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.supplier.count({ where });

    // Map orderBy field name
    const prismaOrderBy = fieldMapping[orderBy] || orderBy;

    // Get paginated data
    const data = await this.prisma.supplier.findMany({
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