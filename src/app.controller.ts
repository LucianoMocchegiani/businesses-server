import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import admin from './firebase/firebase-admin';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('firebase-status')
  getFirebaseStatus() {
    try {
      const app = admin.app();
      return {
        status: 'OK',
        projectId: app.options.projectId,
        initialized: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'ERROR',
        error: error.message,
        initialized: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('health')
  async getHealthCheck() {
    const timestamp = new Date().toISOString();
    
    // Check database
    let dbStatus = 'OK';
    let dbError: string | null = null;
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = 'ERROR';
      dbError = error.message;
    }

    // Check Firebase
    let firebaseStatus = 'OK';
    let firebaseError: string | null = null;
    try {
      const app = admin.app();
      if (!app.options.projectId) {
        firebaseStatus = 'ERROR';
        firebaseError = 'No project ID configured';
      }
    } catch (error) {
      firebaseStatus = 'ERROR';
      firebaseError = error.message;
    }

    const isHealthy = dbStatus === 'OK' && firebaseStatus === 'OK';

    return {
      status: isHealthy ? 'OK' : 'ERROR',
      timestamp,
      services: {
        database: {
          status: dbStatus,
          error: dbError,
          url: process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@') // Hide password
        },
        firebase: {
          status: firebaseStatus,
          error: firebaseError,
          projectId: admin.app().options.projectId || 'Not configured'
        }
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }
}
