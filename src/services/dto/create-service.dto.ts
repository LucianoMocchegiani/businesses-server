import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ 
    example: 'inventory',
    description: 'Nombre único del servicio' 
  })
  @IsString({ message: 'El nombre del servicio debe ser un string' })
  service_name: string;

  @ApiPropertyOptional({ 
    example: 'Gestión de inventarios y stock',
    description: 'Descripción del servicio',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un string' })
  description?: string;
}
