import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBusinessProductDto {
  @ApiProperty({ 
    example: 1,
    description: 'ID del negocio al que pertenece el producto' 
  })
  @IsNumber({}, { message: 'El ID del negocio debe ser un número' })
  business_id: number;

  @ApiPropertyOptional({ 
    example: 'Producto Custom',
    description: 'Nombre del producto específico del negocio',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'El nombre del producto debe ser un string' })
  product_name?: string;

  @ApiPropertyOptional({ 
    example: 'Producto personalizado para este negocio',
    description: 'Descripción del producto',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un string' })
  product_description?: string;

  @ApiPropertyOptional({ 
    example: 'CUSTOM-001',
    description: 'Código único del producto',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'El código del producto debe ser un string' })
  product_code?: string;

  @ApiPropertyOptional({ 
    example: 1,
    description: 'ID del usuario que crea el producto',
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del creador debe ser un número' })
  creator_id?: number;
}
