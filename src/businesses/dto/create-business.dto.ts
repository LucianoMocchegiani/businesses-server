import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({ 
    example: 'Mi Negocio SA',
    description: 'Nombre del negocio' 
  })
  @IsString({ message: 'El nombre del negocio debe ser un string' })
  business_name: string;

  @ApiProperty({ 
    example: 'Calle Falsa 123, CABA',
    description: 'Dirección del negocio',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser un string' })
  business_address?: string;

  @ApiProperty({ 
    example: '+5411-1234-5678',
    description: 'Teléfono del negocio',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string' })
  business_phone?: string;

  @ApiProperty({ 
    example: '20-12345678-9',
    description: 'CUIL del negocio',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'El CUIL debe ser un string' })
  cuil?: string;

  @ApiProperty({ 
    example: 123,
    description: 'ID del usuario propietario' 
  })
  @IsNumber({}, { message: 'El ID del propietario debe ser un número' })
  owner_id: number;
}
