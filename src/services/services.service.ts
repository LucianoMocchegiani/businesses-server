import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Service } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Service[]> {
    return this.prisma.service.findMany({
      orderBy: {
        service_name: 'asc'
      }
    });
  }

  async findOne(service_id: number): Promise<Service | null> {
    return this.prisma.service.findUnique({
      where: { service_id },
      include: {
        permissions: true
      }
    });
  }

  async create(data: Omit<Service, 'service_id' | 'created_at' | 'updated_at'>): Promise<Service> {
    return this.prisma.service.create({
      data
    });
  }

  async update(service_id: number, data: Partial<Omit<Service, 'service_id' | 'created_at' | 'updated_at'>>): Promise<Service> {
    return this.prisma.service.update({
      where: { service_id },
      data
    });
  }

  async delete(service_id: number): Promise<Service> {
    return this.prisma.service.delete({
      where: { service_id }
    });
  }

  async findByName(service_name: string): Promise<Service | null> {
    return this.prisma.service.findUnique({
      where: { service_name }
    });
  }

  // Crear servicios por defecto si no existen
  async seedDefaultServices(): Promise<void> {
    const defaultServices = [
      { service_name: 'users', description: 'Gestión de usuarios' },
      { service_name: 'customers', description: 'Gestión de clientes' },
      { service_name: 'products', description: 'Gestión de productos' },
      { service_name: 'sales', description: 'Gestión de ventas' },
      { service_name: 'purchases', description: 'Gestión de compras' },
      { service_name: 'suppliers', description: 'Gestión de proveedores' },
      { service_name: 'inventory', description: 'Gestión de inventario' },
      { service_name: 'businesses', description: 'Gestión de negocios' }
    ];

    for (const service of defaultServices) {
      const existing = await this.findByName(service.service_name);
      if (!existing) {
        await this.create(service);
      }
    }
  }
}
