# Patrones de Diseño - Backend (NestJS)

## Tabla de Contenidos
- [Introducción](#introducción)
- [Arquitectura y Estructura](#arquitectura-y-estructura)
- [Patrones de Controladores](#patrones-de-controladores)
- [Patrones de Servicios](#patrones-de-servicios)
- [Patrones de DTOs](#patrones-de-dtos)
- [Patrones de Módulos](#patrones-de-módulos)
- [Patrones de Middlewares](#patrones-de-middlewares)
- [Patrones de Base de Datos](#patrones-de-base-de-datos)
- [Patrones de Validación](#patrones-de-validación)
- [Patrones de Manejo de Errores](#patrones-de-manejo-de-errores)
- [Patrones de Documentación](#patrones-de-documentación)

## Introducción

Esta documentación establece los patrones de diseño estándar que deben seguirse en el backend del sistema Business Admin. Todos los nuevos desarrollos y modificaciones deben adherirse a estos patrones para mantener consistencia, legibilidad y mantenibilidad del código.

## Arquitectura y Estructura

### Estructura de Directorios
```
src/
├── common/                 # Utilidades compartidas
│   ├── middlewares/       # Middlewares globales
│   ├── types/            # Tipos compartidos
│   └── decorators/       # Decoradores personalizados
├── config/               # Configuración de la aplicación
├── [module]/            # Módulos de dominio
│   ├── dto/             # Data Transfer Objects
│   ├── [module].controller.ts
│   ├── [module].service.ts
│   └── [module].module.ts
├── prisma/              # Configuración de Prisma
└── main.ts              # Punto de entrada
```

### Principios de Arquitectura
1. **Separación de responsabilidades**: Controladores, servicios y DTOs bien definidos
2. **Inyección de dependencias**: Usar decorador `@Injectable()`
3. **Modularidad**: Un módulo por dominio de negocio
4. **Tipado fuerte**: TypeScript en toda la aplicación

## Patrones de Controladores

### Estructura Estándar
```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, Headers, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { [Entity]Service } from './[entity].service';
import { Create[Entity]Dto, Update[Entity]Dto, Get[Entity]Dto } from './dto';
import { BusinessHeaders } from '../common/types';

@ApiTags('[entities]')
@Controller('[entities]')
export class [Entity]Controller {
  constructor(private readonly [entity]Service: [Entity]Service) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los [entities]' })
  @ApiResponse({ status: 200, description: 'Lista de [entities]' })
  async findAll(
    @Headers() headers: BusinessHeaders,
    @Query() dto: Get[Entity]Dto
  ) {
    try {
      return await this.[entity]Service.findAll(headers, dto);
    } catch (error) {
      throw new HttpException(
        `Error al obtener [entities]: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener [entity] por ID' })
  @ApiParam({ name: 'id', description: 'ID del [entity]' })
  @ApiResponse({ status: 200, description: '[Entity] encontrado' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.[entity]Service.findOne(Number(id));
    } catch (error) {
      throw new HttpException(
        `Error al obtener [entity]: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear [entity]' })
  @ApiBody({ type: Create[Entity]Dto })
  @ApiResponse({ status: 201, description: '[Entity] creado' })
  async create(
    @Body() dto: Create[Entity]Dto,
    @Headers() headers: BusinessHeaders
  ) {
    try {
      return await this.[entity]Service.create(dto, headers);
    } catch (error) {
      throw new HttpException(
        `Error al crear [entity]: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar [entity]' })
  @ApiParam({ name: 'id', description: 'ID del [entity]' })
  @ApiBody({ type: Update[Entity]Dto })
  @ApiResponse({ status: 200, description: '[Entity] actualizado' })
  async update(
    @Param('id') id: string,
    @Body() dto: Update[Entity]Dto
  ) {
    try {
      return await this.[entity]Service.update(Number(id), dto);
    } catch (error) {
      throw new HttpException(
        `Error al actualizar [entity]: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar [entity]' })
  @ApiParam({ name: 'id', description: 'ID del [entity]' })
  @ApiResponse({ status: 200, description: '[Entity] eliminado' })
  async remove(@Param('id') id: string) {
    try {
      return await this.[entity]Service.remove(Number(id));
    } catch (error) {
      throw new HttpException(
        `Error al eliminar [entity]: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
```

### Reglas para Controladores
1. **Un controlador por entidad de dominio**
2. **Usar decoradores de Swagger en todos los endpoints**
3. **Manejo de errores con try-catch**
4. **Headers de contexto como parámetros tipados**
5. **Validación automática con DTOs**
6. **Prefijo REST estándar** (`@Controller('[entities]')`)

## Patrones de Servicios

### Estructura Estándar
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { [Entity] } from '@prisma/client';
import { Create[Entity]Dto, Update[Entity]Dto, Get[Entity]Dto } from './dto';
import { BusinessHeaders } from '../common/types';

export interface [Entity]Response {
  data: [Entity][];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class [Entity]Service {
  constructor(private prisma: PrismaService) {}

  async findAll(headers: BusinessHeaders, dto: Get[Entity]Dto): Promise<[Entity]Response> {
    const businessId = parseInt(headers['x-business-id']);
    const { 
      page = 1, 
      limit = 10, 
      order_by = 'created_at', 
      order_direction = 'desc',
      // ... otros filtros específicos
    } = dto;

    // Construir filtros
    const where: any = { business_id: businessId };
    
    if (dto.name) {
      where.name = { contains: dto.name, mode: 'insensitive' };
    }
    
    if (dto.is_active !== undefined) {
      where.is_active = dto.is_active;
    }

    // Paginación
    const skip = (page - 1) * limit;
    const total = await this.prisma.[entity].count({ where });
    
    // Obtener datos
    const data = await this.prisma.[entity].findMany({
      where,
      orderBy: { [order_by]: order_direction },
      skip,
      take: limit,
      include: {
        // Relaciones necesarias
      }
    });

    return {
      data,
      total,
      page,
      last_page: Math.ceil(total / limit)
    };
  }

  async findOne(id: number): Promise<[Entity] | null> {
    return this.prisma.[entity].findUnique({
      where: { [entity]_id: id },
      include: {
        // Relaciones necesarias
      }
    });
  }

  async create(dto: Create[Entity]Dto, headers: BusinessHeaders): Promise<[Entity]> {
    const businessId = parseInt(headers['x-business-id']);
    
    return this.prisma.[entity].create({
      data: {
        ...dto,
        business_id: businessId,
      },
      include: {
        // Relaciones necesarias
      }
    });
  }

  async update(id: number, dto: Update[Entity]Dto): Promise<[Entity]> {
    return this.prisma.[entity].update({
      where: { [entity]_id: id },
      data: dto,
      include: {
        // Relaciones necesarias
      }
    });
  }

  async remove(id: number): Promise<[Entity]> {
    return this.prisma.[entity].delete({
      where: { [entity]_id: id }
    });
  }

  // Métodos auxiliares específicos del dominio
  async findByBusiness(businessId: number): Promise<[Entity][]> {
    return this.prisma.[entity].findMany({
      where: { business_id: businessId },
      orderBy: { created_at: 'desc' }
    });
  }
}
```

### Reglas para Servicios
1. **Inyección de PrismaService**
2. **Métodos CRUD estándar**: `findAll`, `findOne`, `create`, `update`, `remove`
3. **Paginación en findAll**
4. **Contexto de negocio automático** (business_id del header)
5. **Filtros de búsqueda** opcionales
6. **Interfaces de respuesta tipadas**
7. **Includes de relaciones** cuando sea necesario

## Patrones de DTOs

### Create DTO
```typescript
import { IsString, IsOptional, IsEmail, IsNumber, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create[Entity]Dto {
  @ApiProperty({ description: 'Nombre del [entity]' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({ description: 'Descripción del [entity]' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ description: 'Email de contacto' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  email?: string;

  @ApiPropertyOptional({ description: 'Estado activo', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
```

### Update DTO
```typescript
import { PartialType } from '@nestjs/swagger';
import { Create[Entity]Dto } from './create-[entity].dto';

export class Update[Entity]Dto extends PartialType(Create[Entity]Dto) {}
```

### Get DTO (Filtros y Paginación)
```typescript
import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class Get[Entity]Dto {
  @ApiPropertyOptional({ description: 'Página', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Elementos por página', default: 10, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Campo para ordenar', default: 'created_at' })
  @IsOptional()
  @IsString()
  order_by?: string = 'created_at';

  @ApiPropertyOptional({ description: 'Dirección de orden', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order_direction?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Filtrar por nombre' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado activo' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}
```

### Reglas para DTOs
1. **Validaciones con class-validator**
2. **Transformaciones automáticas** (trim, toLowerCase)
3. **Documentación con Swagger**
4. **Campos opcionales** marcados correctamente
5. **Herencia con PartialType** para Update DTOs
6. **Paginación estándar** en Get DTOs

## Patrones de Módulos

### Estructura Estándar
```typescript
import { Module } from '@nestjs/common';
import { [Entity]Controller } from './[entity].controller';
import { [Entity]Service } from './[entity].service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [[Entity]Controller],
  providers: [[Entity]Service],
  exports: [[Entity]Service]
})
export class [Entity]Module {}
```

### Reglas para Módulos
1. **Un módulo por dominio**
2. **Importar PrismaModule**
3. **Exportar servicios** para uso en otros módulos
4. **Controladores y servicios** declarados explícitamente

## Patrones de Middlewares

### Middleware de Autenticación
```typescript
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CustomMiddleware implements NestMiddleware {
  constructor(private readonly someService: SomeService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Rutas públicas
    const publicRoutes = [
      { method: 'GET', path: '/api/health' }
    ];

    // Verificar si es ruta pública
    const isPublicRoute = publicRoutes.some(route => 
      req.method === route.method && req.url.startsWith(route.path)
    );

    if (isPublicRoute) {
      return next();
    }

    try {
      // Lógica de validación
      const result = await this.validateRequest(req);
      
      if (!result.isValid) {
        throw new UnauthorizedException(result.message);
      }

      // Adjuntar datos al request
      req.user = result.user;
      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private async validateRequest(req: Request) {
    // Implementar lógica de validación
  }
}
```

## Patrones de Base de Datos

### Transacciones
```typescript
async createComplexEntity(data: CreateComplexDto): Promise<ComplexEntity> {
  return await this.prisma.$transaction(async (tx) => {
    // 1. Crear entidad principal
    const mainEntity = await tx.mainEntity.create({
      data: {
        name: data.name,
        // ... otros campos
      }
    });

    // 2. Crear entidades relacionadas
    const relatedEntities = await Promise.all(
      data.relatedData.map(item => 
        tx.relatedEntity.create({
          data: {
            main_entity_id: mainEntity.id,
            ...item
          }
        })
      )
    );

    // 3. Retornar resultado completo
    return {
      ...mainEntity,
      relatedEntities
    };
  });
}
```

### Queries Complejas
```typescript
async getEntityWithRelations(id: number) {
  return this.prisma.entity.findUnique({
    where: { id },
    include: {
      relatedEntities: {
        where: { is_active: true },
        orderBy: { created_at: 'desc' }
      },
      anotherRelation: {
        select: {
          id: true,
          name: true,
          // Solo campos necesarios
        }
      }
    }
  });
}
```

## Patrones de Validación

### Validaciones Personalizadas
```typescript
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsBusinessContext(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBusinessContext',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Lógica de validación personalizada
          return typeof value === 'number' && value > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Business context must be a positive number';
        }
      }
    });
  };
}
```

## Patrones de Manejo de Errores

### Exception Filters
```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

## Patrones de Documentación

### Swagger Documentation
```typescript
@ApiTags('entities')
@Controller('entities')
@ApiExtraModels(CreateEntityDto, UpdateEntityDto)
export class EntityController {
  @Get()
  @ApiOperation({ 
    summary: 'Obtener lista de entidades',
    description: 'Retorna una lista paginada de entidades con filtros opcionales'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de entidades obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Entity' } },
        total: { type: 'number' },
        page: { type: 'number' },
        last_page: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Error en los parámetros de consulta' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll(@Query() dto: GetEntityDto) {
    // Implementación
  }
}
```

## Checklist de Implementación

### Para cada nuevo módulo:
- [ ] Estructura de directorios estándar
- [ ] Controller con todos los endpoints CRUD
- [ ] Service con métodos estándar
- [ ] DTOs (Create, Update, Get) con validaciones
- [ ] Module con imports/exports correctos
- [ ] Documentación Swagger completa
- [ ] Manejo de errores con try-catch
- [ ] Headers de contexto implementados
- [ ] Paginación en listados
- [ ] Filtros de búsqueda
- [ ] Pruebas unitarias (cuando aplique)

### Verificaciones de calidad:
- [ ] Tipado fuerte en toda la implementación
- [ ] Validaciones de entrada completas
- [ ] Manejo de casos edge
- [ ] Consistencia con patrones existentes
- [ ] Documentación actualizada
- [ ] Performance optimizado (queries, paginación)
- [ ] Seguridad implementada (permisos, validaciones)

Este documento debe ser la referencia principal para cualquier desarrollo en el backend. Mantener consistencia con estos patrones es fundamental para la mantenibilidad y escalabilidad del sistema. 