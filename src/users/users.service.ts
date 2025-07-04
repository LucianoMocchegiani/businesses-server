import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(user_id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { user_id } });
  }

  async findByFirebaseUid(firebase_uid: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { firebase_uid } });
  }

  async create(data: Omit<User, 'user_id' | 'created_at' | 'updated_at'>): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(user_id: number, data: Partial<Omit<User, 'user_id' | 'created_at' | 'updated_at'>>): Promise<User> {
    return this.prisma.user.update({
      where: { user_id },
      data,
    });
  }
}