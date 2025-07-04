import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Profile, ProfileUser } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async findAll(business_id: number) {
    return this.prisma.profile.findMany({
      where: { business_id },
      include: {
        permissions: {
          include: {
            service: true
          }
        },
        profileUsers: {
          include: {
            user: true
          }
        }
      }
    });
  }

  async findByUser(user_id: number) {
    const profileUsers = await this.prisma.profileUser.findMany({
      where: { user_id },
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

    return profileUsers.map(pu => pu.profile);
  }

  async findOne(profile_id: number): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: { profile_id },
      include: {
        business: true,
        permissions: {
          include: {
            service: true
          }
        },
        profileUsers: {
          include: {
            user: true
          }
        }
      }
    });
  }

  async findPermissions(profile_id: number) {
    return this.prisma.permission.findMany({
      where: { profile_id },
      include: {
        service: true
      }
    });
  }

  async create(data: any): Promise<Profile> {
    const { permissions, ...profileData } = data;
    
    const profile = await this.prisma.profile.create({
      data: profileData
    });

    // Si se proporcionan permisos, crearlos
    if (permissions && permissions.length > 0) {
      await this.createPermissions(profile.profile_id, permissions);
    }

    return profile;
  }

  async createPermissions(profile_id: number, permissions: any[]) {
    const permissionData = permissions.map(perm => ({
      profile_id,
      service_id: perm.service_id,
      can_get: perm.can_get || false,
      can_post: perm.can_post || false,
      can_put: perm.can_put || false,
      can_delete: perm.can_delete || false
    }));

    return this.prisma.permission.createMany({
      data: permissionData
    });
  }

  async update(profile_id: number, data: any): Promise<Profile> {
    const { permissions, ...profileData } = data;

    const profile = await this.prisma.profile.update({
      where: { profile_id },
      data: profileData
    });

    // Si se proporcionan permisos, actualizarlos
    if (permissions) {
      // Eliminar permisos existentes
      await this.prisma.permission.deleteMany({
        where: { profile_id }
      });
      
      // Crear nuevos permisos
      if (permissions.length > 0) {
        await this.createPermissions(profile_id, permissions);
      }
    }

    return profile;
  }

  async remove(profile_id: number) {
    // Eliminar permisos asociados
    await this.prisma.permission.deleteMany({
      where: { profile_id }
    });

    // Eliminar relaciones usuario-perfil
    await this.prisma.profileUser.deleteMany({
      where: { profile_id }
    });

    // Eliminar perfil
    return this.prisma.profile.delete({
      where: { profile_id }
    });
  }

  async assignUserToProfile(user_id: number, profile_id: number): Promise<ProfileUser> {
    return this.prisma.profileUser.create({
      data: {
        user_id,
        profile_id
      }
    });
  }

  async removeUserFromProfile(user_id: number, profile_id: number) {
    return this.prisma.profileUser.deleteMany({
      where: {
        user_id,
        profile_id
      }
    });
  }
}
