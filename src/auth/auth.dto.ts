import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'The email of the user', example: 'test@empowher.com' })
  email: string;

  @ApiProperty({ description: 'The plain text password', example: 'secure_password_123' })
  passwordHash: string;

  @ApiProperty({ example: 'Ada' })
  firstName: string;

  @ApiProperty({ example: 'Lovelace' })
  lastName: string;
}

export class LoginDto {
  @ApiProperty({ example: 'test@empowher.com' })
  email: string;

  @ApiProperty({ example: 'secure_password_123' })
  password: string;
}
