import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Profile } from '@prisma/client';
import { Request } from 'express';

@Controller('profiles')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) { }

    @Get()
    findAll(@Req() req: Request) {
        if (!req.businessId) {
            throw new Error('Business ID is required');
        }
        return this.profilesService.findAll(req.businessId);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.profilesService.findByUser(Number(userId));
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Profile | null> {
        return this.profilesService.findOne(Number(id));
    }

    @Get(':id/permissions')
    findPermissions(@Param('id') id: string) {
        return this.profilesService.findPermissions(Number(id));
    }

    @Post()
    create(@Body() data: any) {
        return this.profilesService.create(data);
    }

    @Post(':id/permissions')
    createPermissions(@Param('id') id: string, @Body() permissions: any[]) {
        return this.profilesService.createPermissions(Number(id), permissions);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.profilesService.update(Number(id), data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.profilesService.remove(Number(id));
    }
}
