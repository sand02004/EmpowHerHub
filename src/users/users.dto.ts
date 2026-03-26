import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'New Name' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'New Last Name' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+250123456789' })
  phoneNumber?: string;
}
