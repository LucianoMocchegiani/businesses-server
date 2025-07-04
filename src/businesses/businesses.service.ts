import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Business } from '@prisma/client';

interface CreateBusinessWithOwnerDto {
  name: string;
  address?: string;
  phone?: string;
  owner_profile_name: string;
  owner_user_id: number;
}

@Injectable()
export class BusinessesService {
  constructor(private prisma: PrismaService) {}

  // traer todos los negocios de un usuario por user_id
  async findAll(user_id: number): Promise<Business[]> {
    return this.prisma.business.findMany({ where: { owner_id: user_id } });
  }

  // Obtener negocios donde el usuario tiene perfiles asignados
  async findUserBusinesses(userId: number) {
    const profileUsers = await this.prisma.profileUser.findMany({
      where: { user_id: userId },
      include: {
        profile: {
          include: {
            business: true,
            permissions: {
              include: {
                service: true
              }
            }
          }
        }
      }
    });

    return profileUsers.map(pu => ({
      business: pu.profile.business,
      profile: {
        profile_id: pu.profile.profile_id,
        profile_name: pu.profile.profile_name,
        permissions: pu.profile.permissions
      }
    }));
  }

  // Crear negocio con perfil de owner automático
  async createBusinessWithOwner(data: CreateBusinessWithOwnerDto) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Crear el business
      const business = await tx.business.create({
        data: {
          business_name: data.name,
          business_address: data.address,
          business_phone: data.phone,
          owner_id: data.owner_user_id
        }
      });

      // 2. Obtener todos los servicios disponibles
      const services = await tx.service.findMany();

      // 3. Crear el perfil de admin con todos los permisos
      const adminProfile = await tx.profile.create({
        data: {
          business_id: business.business_id,
          profile_name: data.owner_profile_name
        }
      });

      // 4. Crear permisos completos para todos los servicios
      const permissions = services.map(service => ({
        profile_id: adminProfile.profile_id,
        service_id: service.service_id,
        can_get: true,
        can_post: true,
        can_put: true,
        can_delete: true
      }));

      await tx.permission.createMany({
        data: permissions
      });

      // 5. Asignar el perfil al usuario owner
      await tx.profileUser.create({
        data: {
          profile_id: adminProfile.profile_id,
          user_id: data.owner_user_id
        }
      });

      // 6. Retornar el business con el perfil creado
      return {
        business,
        profile: {
          ...adminProfile,
          permissions: permissions.map(p => ({
            ...p,
            service: services.find(s => s.service_id === p.service_id)
          }))
        }
      };
    });
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