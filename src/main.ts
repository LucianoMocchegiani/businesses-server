// Cargar variables de entorno ANTES que cualquier otra cosa
import './config/environment';
import { validateEnvironment } from './config/environment';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { BigIntSerializationInterceptor } from './common/interceptors/bigint-serialization.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // Validar variables de entorno antes de inicializar la aplicación
  validateEnvironment();
  
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'X-Business-Id',
      'X-Profile-Id',
    ],
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  // Global validation pipe with transformations enabled
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new BigIntSerializationInterceptor()
  );

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Business Admin API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-business-id', in: 'header' }, 'business-id')
    .addApiKey({ type: 'apiKey', name: 'x-profile-id', in: 'header' }, 'profile-id')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});