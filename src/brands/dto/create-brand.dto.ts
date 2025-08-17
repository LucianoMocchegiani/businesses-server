import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ 
    example: 'Nike',
    description: 'Nombre de la marca' 
  })
  @IsString({ message: 'El nombre de la marca debe ser un string' })
  brand_name: string;

  @ApiPropertyOptional({ 
    example: 'Marca deportiva líder mundial',
    description: 'Descripción de la marca',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un string' })
  brand_description?: string;
}
