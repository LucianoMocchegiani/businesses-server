import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ 
    example: 'nuevo@usuario.com',
    description: 'Email del usuario' 
  })
  @IsEmail({}, { message: 'Email debe tener un formato válido' })
  email: string;

  @ApiProperty({ 
    example: 'password123',
    description: 'Contraseña del usuario (mínimo 6 caracteres)' 
  })
  @IsString({ message: 'Password debe ser un string' })
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  password: string;
}
