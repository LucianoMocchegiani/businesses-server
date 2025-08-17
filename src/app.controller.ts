import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import admin from './firebase/firebase-admin';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto, SignupDto } from './auth/dto';

@ApiTags('auth')
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

  @Post('auth/login')
  @ApiOperation({ 
    summary: 'Login con email y contraseña',
    description: 'Inicia sesión con Firebase y devuelve el token para usar en Swagger'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        idToken: { type: 'string', description: 'Token de Firebase para usar en Authorization' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'string' },
        localId: { type: 'string' },
        email: { type: 'string' },
        instructions: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error de autenticación',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' },
        details: { type: 'string' }
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      // Obtener la API key de Firebase del proyecto
      const firebaseConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
      const apiKey = process.env.FIREBASE_API_KEY || 'AIzaSyBb7lDXxSpZx65XjXe0cSKSORoJwviCTBI';

      // Hacer la petición a Firebase Auth
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginDto.email,
          password: loginDto.password,
          returnSecureToken: true,
          clientType: 'CLIENT_TYPE_WEB'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Error de autenticación',
          details: data.error?.details || 'Credenciales inválidas'
        };
      }

      return {
        success: true,
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        localId: data.localId,
        email: data.email,
        instructions: `✅ Copia este token y úsalo en el botón "Authorize" de Swagger (SIN "Bearer"): ${data.idToken}`
      };

    } catch (error) {
      return {
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      };
    }
  }

  @Post('auth/signup')
  @ApiOperation({ 
    summary: 'Registro de nuevo usuario',
    description: 'Crea una nueva cuenta en Firebase y devuelve el token para usar en Swagger'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        idToken: { type: 'string', description: 'Token de Firebase para usar en Authorization' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'string' },
        localId: { type: 'string' },
        email: { type: 'string' },
        instructions: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error en el registro',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' },
        details: { type: 'string' }
      }
    }
  })
  async signup(@Body() signupDto: SignupDto) {
    try {
      // Obtener la API key de Firebase del proyecto
      const firebaseConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
      const apiKey = process.env.FIREBASE_API_KEY || 'AIzaSyBb7lDXxSpZx65XjXe0cSKSORoJwviCTBI';

      // Hacer la petición a Firebase Auth para crear usuario
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupDto.email,
          password: signupDto.password,
          returnSecureToken: true,
          clientType: 'CLIENT_TYPE_WEB'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Error en el registro',
          details: data.error?.details || 'No se pudo crear la cuenta'
        };
      }

      return {
        success: true,
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        localId: data.localId,
        email: data.email,
        instructions: `✅ Usuario creado exitosamente! Copia este token y úsalo en el botón "Authorize" de Swagger (SIN "Bearer"): ${data.idToken}`
      };

    } catch (error) {
      return {
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      };
    }
  }
}
