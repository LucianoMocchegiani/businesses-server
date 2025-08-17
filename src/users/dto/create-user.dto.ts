import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ 
    example: '2K9NAA8w8aWNmLiY844ByYULCN53',
    description: 'Firebase UID del usuario' 
  })
  @IsString({ message: 'Firebase UID debe ser un string' })
  firebase_uid: string;

  @ApiProperty({ 
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario' 
  })
  @IsString({ message: 'El nombre completo debe ser un string' })
  full_name: string;
}
