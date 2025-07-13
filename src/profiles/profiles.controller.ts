import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Profile } from '@prisma/client';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) { }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los perfiles' })
    @ApiResponse({ status: 200, description: 'Lista de perfiles' })
    async findAll(@Req() req: Request) {
        try {
            if (!req.businessId) {
                throw new HttpException('Business ID es requerido', HttpStatus.BAD_REQUEST);
            }
            return await this.profilesService.findAll(req.businessId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(`Error al obtener los perfiles: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Obtener perfiles por usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario' })
    @ApiResponse({ status: 200, description: 'Perfiles del usuario' })
    async findByUser(@Param('userId') userId: string) {
        try {
            return await this.profilesService.findByUser(Number(userId));
        } catch (error) {
            throw new HttpException(`Error al obtener los perfiles del usuario: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un perfil por ID' })
    @ApiParam({ name: 'id', description: 'ID del perfil' })
    @ApiResponse({ status: 200, description: 'Perfil encontrado' })
    async findOne(@Param('id') id: string): Promise<Profile | null> {
        try {
            return await this.profilesService.findOne(Number(id));
        } catch (error) {
            throw new HttpException(`Error al obtener el perfil: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':id/permissions')
    @ApiOperation({ summary: 'Obtener permisos de un perfil' })
    @ApiParam({ name: 'id', description: 'ID del perfil' })
    @ApiResponse({ status: 200, description: 'Permisos del perfil' })
    async findPermissions(@Param('id') id: string) {
        try {
            return await this.profilesService.findPermissions(Number(id));
        } catch (error) {
            throw new HttpException(`Error al obtener los permisos del perfil: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    @Post()
    @ApiOperation({ summary: 'Crear un perfil' })
    @ApiBody({ description: 'Datos del perfil a crear' })
    @ApiResponse({ status: 201, description: 'Perfil creado' })
    async create(@Body() data: any) {
        try {
            return await this.profilesService.create(data);
        } catch (error) {
            throw new HttpException(`Error al crear el perfil: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    @Post(':id/permissions')
    @ApiOperation({ summary: 'Crear permisos para un perfil' })
    @ApiParam({ name: 'id', description: 'ID del perfil' })
    @ApiBody({ description: 'Lista de permisos a crear' })
    @ApiResponse({ status: 201, description: 'Permisos creados' })
    async createPermissions(@Param('id') id: string, @Body() permissions: any[]) {
        try {
            return await this.profilesService.createPermissions(Number(id), permissions);
        } catch (error) {
            throw new HttpException(`Error al crear los permisos: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un perfil' })
    @ApiParam({ name: 'id', description: 'ID del perfil' })
    @ApiBody({ description: 'Datos a actualizar' })
    @ApiResponse({ status: 200, description: 'Perfil actualizado' })
    async update(@Param('id') id: string, @Body() data: any) {
        try {
            return await this.profilesService.update(Number(id), data);
        } catch (error) {
            throw new HttpException(`Error al actualizar el perfil: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un perfil' })
    @ApiParam({ name: 'id', description: 'ID del perfil' })
    @ApiResponse({ status: 200, description: 'Perfil eliminado' })
    async remove(@Param('id') id: string) {
        try {
            return await this.profilesService.remove(Number(id));
        } catch (error) {
            throw new HttpException(`Error al eliminar el perfil: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }
}
