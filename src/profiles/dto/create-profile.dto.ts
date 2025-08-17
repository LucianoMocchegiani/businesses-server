import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ 
    example: 1,
    description: 'ID del negocio al que pertenece el perfil' 
  })
  @IsNumber({}, { message: 'El ID del negocio debe ser un número' })
  business_id: number;

  @ApiPropertyOptional({ 
    example: 'Vendedor',
    description: 'Nombre del perfil',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'El nombre del perfil debe ser un string' })
  profile_name?: string;
}
