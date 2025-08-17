import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor para transformar valores BigInt a números antes de la serialización JSON
 * 
 * Este interceptor resuelve el error "Do not know how to serialize a BigInt" que ocurre
 * cuando Prisma devuelve campos de tipo bigint que no pueden ser serializados directamente.
 * 
 * Funciona recursivamente en objetos y arrays, convirtiendo todos los valores BigInt a Number.
 */
@Injectable()
export class BigIntSerializationInterceptor implements NestInterceptor {
  private transformValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    // Si es un BigInt, convertirlo a Number
    if (typeof value === 'bigint') {
      return Number(value);
    }

    // Si es un objeto Date, convertirlo a timestamp
    if (value instanceof Date) {
      return value.getTime();
    }

    // Si es un array, transformar cada elemento
    if (Array.isArray(value)) {
      return value.map(item => this.transformValue(item));
    }

    // Si es un objeto, transformar cada propiedad
    if (typeof value === 'object') {
      const transformed: any = {};
      for (const [key, val] of Object.entries(value)) {
        transformed[key] = this.transformValue(val);
      }
      return transformed;
    }

    // Para otros tipos, devolver sin cambios
    return value;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.transformValue(data))
    );
  }
} 