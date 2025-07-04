import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(Number(id));
  }

  @Get('firebase/:uid')
  findByFirebaseUid(@Param('uid') uid: string): Promise<User | null> {
    return this.usersService.findByFirebaseUid(uid);
  }

  @Post()
  create(@Body() data: any, @Req() req: Request): Promise<User> {
    // Si viene de Firebase Auth, usar esos datos; si no, usar los datos del body
    const userData = req.firebaseUser ? {
      firebase_uid: req.firebaseUser.uid,
      full_name: req.firebaseUser.name || data.full_name || req.firebaseUser.email?.split('@')[0] || 'Usuario',
      ...data // Permitir que otros campos del body sobrescriban (excepto email que no existe en el modelo)
    } : data;

    // Remover campos que no existen en el modelo User
    const { email, ...validUserData } = userData;

    return this.usersService.create(validUserData);
  }
}