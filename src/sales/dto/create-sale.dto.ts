import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateSaleDetailDto {
  @ApiPropertyOptional({ description: 'ID del producto de negocio (opcional)' })
  @IsOptional()
  @IsNumber()
  business_product_id?: number | null;

  @ApiPropertyOptional({ description: 'ID del producto global (opcional)' })
  @IsOptional()
  @IsNumber()
  global_product_id?: number | null;

  @ApiProperty({ description: 'Cantidad vendida' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Precio unitario' })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: 'Monto total de la línea (opcional)' })
  @IsOptional()
  @IsNumber()
  total_amount?: number | null;
}

export class CreateSaleDto {
  @ApiProperty({ description: 'ID del negocio' })
  @IsNumber()
  business_id: number;

  @ApiPropertyOptional({ description: 'ID del cliente (opcional)' })
  @IsOptional()
  @IsNumber()
  customer_id?: number | null;

  @ApiPropertyOptional({ description: 'Monto total de la venta (opcional)' })
  @IsOptional()
  @IsNumber()
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