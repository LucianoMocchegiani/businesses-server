import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ 
    example: 'Electrónicos',
    description: 'Nombre de la categoría' 
  })
  @IsString({ message: 'El nombre de la categoría debe ser un string' })
  category_name: string;

  @ApiPropertyOptional({ 
    example: 'Productos electrónicos y dispositivos tecnológicos',
    description: 'Descripción de la categoría',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un string' })
  category_description?: string;
}
