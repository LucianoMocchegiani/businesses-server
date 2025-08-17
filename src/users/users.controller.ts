import { Controller, Get, Post, Param, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  async findAll(): Promise<User[]> {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      throw new HttpException(`Error al obtener los usuarios: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  async findOne(@Param('id') id: string): Promise<User | null> {
    try {
      return await this.usersService.findOne(Number(id));
    } catch (error) {
      throw new HttpException(`Error al obtener el usuario: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('firebase/:uid')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un usuario por Firebase UID' })
  @ApiParam({ name: 'uid', description: 'Firebase UID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  async findByFirebaseUid(@Param('uid') uid: string): Promise<User | null> {
    try {
      return await this.usersService.findByFirebaseUid(uid);
    } catch (error) {
      throw new HttpException(`Error al obtener el usuario por Firebase UID: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiBody({ type: CreateUserDto, description: 'Datos del usuario a crear' })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  async create(@Body() data: CreateUserDto, @Req() req: Request): Promise<User> {
    try {
      return await this.usersService.create(data);
    } catch (error) {
      throw new HttpException(`Error al crear el usuario: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}