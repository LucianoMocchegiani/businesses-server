import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreatePurchaseDetailDto {
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

  @ApiProperty({ description: 'Cantidad comprada' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  quantity: number;

  @ApiProperty({ description: 'Precio unitario' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  price: number;

  @ApiPropertyOptional({ description: 'Número de lote (opcional)' })
  @IsOptional()
  @IsString()
  lot_number?: string | null;

  @ApiPropertyOptional({ description: 'Fecha de ingreso al inventario (opcional)', type: Number })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value === null || value === undefined ? value : Number(value))
  entry_date?: number | null;

  @ApiPropertyOptional({ description: 'Fecha de vencimiento (opcional)', type: Number })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value === null || value === undefined ? value : Number(value))
  expiration_date?: number | null;
}

export class CreatePurchaseDto {
  // business_id ya no va aquí, viene por header x-business-id

  @ApiPropertyOptional({ description: 'ID del proveedor (opcional)' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value === null || value === undefined ? value : Number(value))
  supplier_id?: number | null;

  @ApiPropertyOptional({ description: 'Estado de la compra (opcional)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    type: [CreatePurchaseDetailDto],
    description: 'Detalles de la compra (productos, cantidades, lotes, etc.)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseDetailDto)
  purchaseDetails: CreatePurchaseDetailDto[];
}