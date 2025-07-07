import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetSuppliersDto {
  @ApiPropertyOptional({ description: 'Número de página', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Cantidad de resultados por página', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Campo por el cual ordenar', enum: ['name', 'email', 'createdAt', 'updatedAt'] })
  @IsOptional()
  @IsEnum(['name', 'email', 'createdAt', 'updatedAt'])
  orderBy?: 'name' | 'email' | 'createdAt' | 'updatedAt' = 'createdAt';

  @ApiPropertyOptional({ description: 'Dirección de ordenamiento', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Buscar por nombre del proveedor' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Buscar por email del proveedor' })
  @IsOptional()
  @IsString()
  email?: string;
}
