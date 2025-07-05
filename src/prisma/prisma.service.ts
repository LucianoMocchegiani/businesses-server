import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      this.logger.log('🔌 Connecting to database...');
      await this.$connect();
      
      // Verificar la conexión con una consulta simple
      await this.$queryRaw`SELECT 1`;
      
      this.logger.log('✅ Database connection established successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database:', error.message);
      this.logger.error('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')); // Ocultar password
      
      // Fallar rápido - terminar la aplicación si no hay DB
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    this.logger.log('🔌 Disconnecting from database...');
    await this.$disconnect();
  }
}