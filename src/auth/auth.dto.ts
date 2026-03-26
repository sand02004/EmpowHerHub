import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsArray, IsOptional, MinLength, ArrayMinSize } from 'class-validator';

export class BaseRegisterDto {
  @ApiProperty({ example: 'test@empowher.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secure_password_123' })
  @IsString()
  @MinLength(6)
  passwordHash: string;

  @ApiProperty({ example: 'Ada' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Lovelace' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+250780000000', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class RegisterWomanDto extends BaseRegisterDto {
  @ApiProperty({ example: ['JavaScript', 'React'] })
  @IsArray()
  skills: string[];
}

export class RegisterMentorDto extends BaseRegisterDto {
  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @IsNotEmpty()
  professionalBackground: string;

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  yearsExperience: number;
}

export class RegisterSponsorDto {
  @ApiProperty({ example: 'sponsor@techcorp.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secure_password_123' })
  @IsString()
  @MinLength(6)
  passwordHash: string;

  @ApiProperty({ example: 'Tech Corp Inc.' })
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @ApiProperty({ example: 'Leading tech company supporting women.' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class LoginDto {
  @ApiProperty({ example: 'test@empowher.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secure_password_123' })
  @IsString()
  password: string;
}
