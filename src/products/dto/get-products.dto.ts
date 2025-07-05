import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetProductsDto {
  // business_id ya no va aquí, viene por header x-business-id

  @ApiPropertyOptional({ description: 'Buscar por nombre del producto' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Buscar por código de barras' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Buscar por categoría' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filtrar por productos activos' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Incluir productos globales en los resultados', default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  include_global?: boolean = true;

  @ApiPropertyOptional({ description: 'Incluir productos del negocio en los resultados', default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  include_business?: boolean = true;

  @ApiPropertyOptional({ description: 'Página actual para paginación', default: 1 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : 1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Cantidad de resultados por página', default: 50 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : 50)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Incluir información de stock en la respuesta', default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  include_stock?: boolean = true;

  @ApiPropertyOptional({ description: 'Filtrar solo productos con stock bajo', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  only_low_stock?: boolean = false;
}
