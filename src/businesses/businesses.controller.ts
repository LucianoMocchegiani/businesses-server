import { Controller, Get, Post, Put, Delete, Param, Body, Req, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { BusinessesService } from './businesses.service';
import { Business } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { CreateBusinessDto, CreateBusinessWithOwnerDto } from './dto';

@ApiTags('businesses')
@ApiBearerAuth()
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) { }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los negocios' })
  @ApiResponse({ status: 200, description: 'Lista de negocios' })
  async findAll(@Param('user_id') user_id: number): Promise<Business[]> {
    try {
      return await this.businessesService.findAll(user_id);
    } catch (error) {
      throw new HttpException(`Error al obtener los negocios: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener negocios del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de negocios del usuario' })
  async findUserBusinesses(@Req() req: Request) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        throw new HttpException('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
      }
      return await this.businessesService.findUserBusinesses(userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Error al obtener los negocios del usuario: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un negocio por ID' })
  @ApiParam({ name: 'id', description: 'ID del negocio' })
  @ApiResponse({ status: 200, description: 'Negocio encontrado' })
  async findOne(@Param('id') id: string): Promise<Business | null> {
    try {
      return await this.businessesService.findOne(Number(id));
    } catch (error) {
      throw new HttpException(`Error al obtener el negocio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear un negocio' })
  @ApiBody({ type: CreateBusinessDto, description: 'Datos del negocio a crear' })
  @ApiResponse({ status: 201, description: 'Negocio creado' })
  async create(@Body() data: CreateBusinessDto): Promise<Business> {
    try {
      // Transformar undefined a null para compatibilidad con Prisma
      const businessData = {
        business_name: data.business_name,
        business_address: data.business_address || null,
        business_phone: data.business_phone || null,
        cuil: data.cuil || null,
        owner_id: data.owner_id
      };
      
      return await this.businessesService.create(businessData);
    } catch (error) {
      throw new HttpException(`Error al crear el negocio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('with-owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un negocio con propietario' })
  @ApiBody({ type: CreateBusinessWithOwnerDto, description: 'Datos del negocio y propietario' })
  @ApiResponse({ status: 201, description: 'Negocio creado con propietario' })
  async createWithOwner(@Body() data: CreateBusinessWithOwnerDto, @Req() req: Request) {
    try {
      const userId = req.user?.user_id;
      
      if (!userId) {
        console.error('❌ Usuario no autenticado - req.user:', req.user);
        throw new HttpException('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
      }

      const finalData = {
        ...data,
        owner_user_id: userId
      };

      return await this.businessesService.createBusinessWithOwner(finalData);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Error al crear el negocio con propietario: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un negocio' })
  @ApiParam({ name: 'id', description: 'ID del negocio' })
  @ApiBody({ description: 'Datos a actualizar' })
  @ApiResponse({ status: 200, description: 'Negocio actualizado' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<Business, 'business_id' | 'created_at' | 'updated_at'>>
  ): Promise<Business> {
    try {
      return await this.businessesService.update(Number(id), data);
    } catch (error) {
      throw new HttpException(`Error al actualizar el negocio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un negocio' })
  @ApiParam({ name: 'id', description: 'ID del negocio' })
  @ApiResponse({ status: 200, description: 'Negocio eliminado' })
  async delete(@Param('id') id: string): Promise<Business> {
    try {
      return await this.businessesService.delete(Number(id));
    } catch (error) {
      throw new HttpException(`Error al eliminar el negocio: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}