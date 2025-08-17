import { IsString, IsOptional, IsNumber, IsDecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateGlobalProductDto {
  @ApiProperty({ 
    example: 'iPhone 15 Pro',
    description: 'Nombre del producto global' 
  })
  @IsString({ message: 'El nombre del producto debe ser un string' })
  product_name: string;

  @ApiPropertyOptional({ 
    example: 1,
    description: 'ID de la marca del producto',
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de la marca debe ser un número' })
  brand_id?: number;

  @ApiPropertyOptional({ 
    example: 'Smartphone de última generación con chip A17 Pro',
    description: 'Descripción del producto',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un string' })
  product_description?: string;

  @ApiPropertyOptional({ 
    example: 'APPLE-IP15PRO-128',
    description: 'Código único del producto',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'El código del producto debe ser un string' })
  product_code?: string;

  @ApiPropertyOptional({ 
    example: 1299.99,
    description: 'Precio de venta genérico',
    required: false 
  })
  @IsOptional()
  @IsDecimal({}, { message: 'El precio de venta debe ser un decimal' })
  @Transform(({ value }) => value === null || value === undefined ? value : Number(value))
  generic_sale_price?: number;

  @ApiPropertyOptional({ 
    example: 999.99,
    description: 'Precio de compra genérico',
    required: false 
  })
  @IsOptional()
  @IsDecimal({}, { message: 'El precio de compra debe ser un decimal' })
  @Transform(({ value }) => value === null || value === undefined ? value : Number(value))
  generic_buy_price?: number;
}
