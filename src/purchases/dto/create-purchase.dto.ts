import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreatePurchaseDetailDto {
  @ApiPropertyOptional({ description: 'ID del producto de negocio (opcional)' })
  @IsOptional()
  @IsNumber()
  business_product_id?: number | null;

  @ApiPropertyOptional({ description: 'ID del producto global (opcional)' })
  @IsOptional()
  @IsNumber()
  global_product_id?: number | null;

  @ApiProperty({ description: 'Cantidad comprada' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Precio unitario' })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: 'Monto total de la línea (opcional)' })
  @IsOptional()
  @IsNumber()
  total_amount?: number | null;

  @ApiPropertyOptional({ description: 'Número de lote (opcional)' })
  @IsOptional()
  @IsString()
  lot_number?: string | null;

  @ApiPropertyOptional({ description: 'Fecha de ingreso al inventario (opcional)', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  entry_date?: Date | string | null;

  @ApiPropertyOptional({ description: 'Fecha de vencimiento (opcional)', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  expiration_date?: Date | string | null;
}

export class CreatePurchaseDto {
  @ApiProperty({ description: 'ID del negocio' })
  @IsNumber()
  business_id: number;

  @ApiPropertyOptional({ description: 'ID del proveedor (opcional)' })
  @IsOptional()
  @IsNumber()
  supplier_id?: number | null;

  @ApiPropertyOptional({ description: 'Monto total de la compra (opcional)' })
  @IsOptional()
  @IsNumber()
  total_amount?: number | null;

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