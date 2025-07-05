import { Controller, Get, Post, Put, Delete, Param, Body, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { BusinessesService } from './businesses.service';
import { Business } from '@prisma/client';

interface CreateBusinessWithOwnerDto {
  name: string;
  address?: string;
  phone?: string;
  owner_profile_name: string;
}

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) { }

  @Get()
  findAll(@Param('user_id') user_id: number): Promise<Business[]> {
    return this.businessesService.findAll(user_id);
  }

  @Get('user')
  findUserBusinesses(@Req() req: Request) {
    const userId = req.user?.user_id;
    return this.businessesService.findUserBusinesses(userId!);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Business | null> {
    return this.businessesService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: Omit<Business, 'business_id' | 'created_at' | 'updated_at'>): Promise<Business> {
    return this.businessesService.create(data);
  }

  @Post('with-owner')
  createWithOwner(@Body() data: CreateBusinessWithOwnerDto, @Req() req: Request) {
    
    const userId = req.user?.user_id;
    
    if (!userId) {
      console.error('❌ Usuario no autenticado - req.user:', req.user);
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const finalData = {
      ...data,
      owner_user_id: userId
    };

    return this.businessesService.createBusinessWithOwner(finalData);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<Business, 'business_id' | 'created_at' | 'updated_at'>>
  ): Promise<Business> {
    return this.businessesService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Business> {
    return this.businessesService.delete(Number(id));
  }
}