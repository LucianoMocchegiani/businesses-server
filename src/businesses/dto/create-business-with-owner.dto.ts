import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateBusinessWithOwnerDto {
  @ApiProperty({ 
    example: 'Mi Negocio SA',
    description: 'Nombre del negocio' 
  })
  @IsString({ message: 'El nombre del negocio debe ser un string' })
  name: string;

  @ApiProperty({ 
    example: 'Calle Falsa 123, CABA',
    description: 'Dirección del negocio',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser un string' })
  address?: string;

  @ApiProperty({ 
    example: '+5411-1234-5678',
    description: 'Teléfono del negocio',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string' })
  phone?: string;

  @ApiProperty({ 
    example: 'Administrador Principal',
    description: 'Nombre del perfil del propietario' 
  })
  @IsString({ message: 'El nombre del perfil debe ser un string' })
  owner_profile_name: string;

  @ApiProperty({ 
    example: 123,
    description: 'ID del usuario propietario' 
  })
  @IsNumber({}, { message: 'El ID del propietario debe ser un número' })
  owner_user_id: number;
}
