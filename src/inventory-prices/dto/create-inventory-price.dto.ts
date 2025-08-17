import { IsNumber, IsOptional, IsDecimal, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

enum PriceType {
  SALE = 'SALE',
  BUY = 'BUY'
}

export class CreateInventoryPriceDto {
  @ApiProperty({ 
    example: 1,
    description: 'ID del inventario al que pertenece el precio' 
  })
  @IsNumber({}, { message: 'El ID del inventario debe ser un número' })
  inventory_id: number;

  @ApiProperty({ 
    example: 'SALE',
    description: 'Tipo de precio',
    enum: PriceType
  })
  @IsEnum(PriceType, { message: 'El tipo de precio debe ser SALE o BUY' })
  price_type: PriceType;

  @ApiProperty({ 
    example: 299.99,
    description: 'Precio del producto' 
  })
  @IsDecimal({}, { message: 'El precio debe ser un decimal' })
  @Transform(({ value }) => Number(value))
  price: number;

  @ApiProperty({ 
    example: 1640995200000,
    description: 'Fecha desde la cual es válido el precio (timestamp)' 
  })
  @IsNumber({}, { message: 'La fecha de inicio debe ser un número (timestamp)' })
  valid_from: number;

  @ApiPropertyOptional({ 
    example: 1672531200000,
    description: 'Fecha hasta la cual es válido el precio (timestamp)',
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'La fecha de fin debe ser un número (timestamp)' })
  valid_to?: number;
}
