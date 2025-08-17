import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Interceptor para loggear todas las consultas HTTP
 * 
 * Este interceptor registra información detallada sobre cada request HTTP:
 * - Método HTTP y URL
 * - Headers importantes (Authorization, Content-Type, etc.)
 * - Body del request (sin datos sensibles)
 * - Tiempo de respuesta
 * - Status code de respuesta
 * - Usuario autenticado (si existe)
 * 
 * Útil para:
 * - Debugging de APIs
 * - Monitoreo de performance
 * - Auditoría de accesos
 * - Troubleshooting de autenticación
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly enableDetailedLogging = process.env.ENABLE_DETAILED_LOGGING === 'true' || process.env.NODE_ENV === 'development';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const { method, url, headers, body } = request;

    // Rutas que no queremos loggear (para evitar spam en logs)
    const skipLogging = this.shouldSkipLogging(url);
    if (skipLogging) {
      return next.handle();
    }
    const userAgent = headers['user-agent'] || '';
    const userEmail = (request as any).user?.email || 'Anonymous';
    const userId = (request as any).user?.user_id || 'N/A';
    const businessId = headers['x-business-id'] || 'N/A';
    const profileId = headers['x-profile-id'] || 'N/A';
    
    const startTime = Date.now();

    // Log del request entrante
    this.logger.log(`📨 ${method} ${url} | User: ${userEmail} (${userId}) | Business: ${businessId} | Profile: ${profileId}`);
    
    // Log adicional para requests con body (POST, PUT, PATCH) - solo en desarrollo
    if (this.enableDetailedLogging && ['POST', 'PUT', 'PATCH'].includes(method) && body) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`📝 Body: ${JSON.stringify(sanitizedBody)}`);
    }

    // Log de headers importantes - solo en desarrollo
    if (this.enableDetailedLogging) {
      const importantHeaders = this.extractImportantHeaders(headers);
      if (Object.keys(importantHeaders).length > 0) {
        this.logger.debug(`📋 Headers: ${JSON.stringify(importantHeaders)}`);
      }
    }

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const statusCode = response.statusCode;
          
          // Determinar el color del log según el status code
          const logMethod = this.getLogMethodByStatus(statusCode);
          
          this.logger[logMethod](
            `✅ ${method} ${url} | ${statusCode} | ${duration}ms | User: ${userEmail}`
          );

          // Log adicional para respuestas grandes o con errores
          if (statusCode >= 400) {
            this.logger.warn(`❌ Error Response: ${JSON.stringify(responseData)}`);
          } else if (duration > 2000) {
            this.logger.warn(`⚠️ Slow Response: ${duration}ms for ${method} ${url}`);
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          this.logger.error(
            `💥 ${method} ${url} | ERROR | ${duration}ms | User: ${userEmail} | Error: ${error.message}`
          );
        }
      })
    );
  }

  /**
   * Sanitiza el body del request removiendo datos sensibles
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[HIDDEN]';
      }
    }

    return sanitized;
  }

  /**
   * Extrae headers importantes para logging
   */
  private extractImportantHeaders(headers: any): any {
    const important = {};
    const relevantHeaders = [
      'content-type',
      'content-length',
      'x-business-id',
      'x-profile-id',
      'origin',
      'referer'
    ];

    for (const header of relevantHeaders) {
      if (headers[header]) {
        important[header] = headers[header];
      }
    }

    // Log si hay token de autorización (sin mostrar el token completo)
    if (headers['authorization']) {
      important['authorization'] = headers['authorization'].startsWith('Bearer ') 
        ? 'Bearer [TOKEN]' 
        : '[AUTH_HEADER]';
    }

    return important;
  }

  /**
   * Determina el método de log según el status code
   */
  private getLogMethodByStatus(statusCode: number): 'log' | 'warn' | 'error' {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    return 'log';
  }

  /**
   * Determina si se debe omitir el logging para ciertas rutas
   */
  private shouldSkipLogging(url: string): boolean {
    const skipRoutes = [
      '/api/health',           // Health checks frecuentes
      '/api/favicon.ico',      // Favicon requests
      '/api/docs',             // Swagger UI assets (si son frecuentes)
    ];

    // Solo loggear health checks cada 10 requests (para no hacer spam)
    if (url === '/api/health') {
      return Math.random() > 0.1; // 10% de probabilidad de loggear
    }

    return skipRoutes.some(route => url.startsWith(route));
  }
}
