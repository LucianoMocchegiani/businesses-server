import {
  IsString,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  // business_id ya no va aquí, viene por header x-business-id

  @ApiProperty({ description: 'Nombre del proveedor' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  supplier_name: string;

  @ApiPropertyOptional({ description: 'Nombre de contacto del proveedor' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  contact_name?: string;

  @ApiPropertyOptional({ description: 'Email de contacto del proveedor' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  contact_email?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto del proveedor' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  contact_phone?: string;

  @ApiPropertyOptional({ description: 'Ubicación/dirección del proveedor' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  contact_location?: string;

  @ApiPropertyOptional({ description: 'Descripción o notas adicionales sobre el proveedor' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  contact_description?: string;
} 