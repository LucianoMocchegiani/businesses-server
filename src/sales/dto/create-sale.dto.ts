import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateSaleDetailDto {
  @ApiPropertyOptional({ description: 'ID del producto de negocio (opcional)' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value === null || value === undefined ? value : Number(value))
  business_product_id?: number | null;

  @ApiPropertyOptional({ description: 'ID del producto global (opcional)' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value === null || value === undefined ? value : Number(value))
  global_product_id?: number | null;

  @ApiProperty({ description: 'Cantidad vendida' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  quantity: number;

  @ApiProperty({ description: 'Precio unitario' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  price: number;

  @ApiPropertyOptional({ description: 'Monto total de la línea (opcional)' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value === null || value === undefined ? value : Number(value))
  total_amount?: number | null;
}

export class CreateSaleDto {
  // business_id ya no va aquí, viene por header x-business-id

  @ApiPropertyOptional({ description: 'ID del cliente (opcional)' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value === null || value === undefined ? value : Number(value))
  customer_id?: number | null;

  @ApiPropertyOptional({ description: 'Monto total de la venta (opcional)' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value === null || value === undefined ? value : Number(value))
  total_amount?: number | null;

  @ApiPropertyOptional({ description: 'Estado de la venta (opcional)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    type: [CreateSaleDetailDto],
    description: 'Detalles de la venta (productos, cantidades, precios, etc.)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleDetailDto)
  saleDetails: CreateSaleDetailDto[];
}