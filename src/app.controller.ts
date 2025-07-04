import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import admin from './firebase/firebase-admin';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
}
