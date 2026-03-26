import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class ApplyMentorshipDto {
  @ApiProperty({ description: 'ID of the mentor', example: 'uuid-here' })
  mentorId: string;

  @ApiProperty({ description: 'ID of the mentee applying', example: 'uuid-here' })
  menteeId: string;

  @ApiPropertyOptional({ example: 'I admire your work and would love mentorship!' })
  message?: string;
}

export class UpdateMentorshipStatusDto {
  @ApiProperty({ enum: ApplicationStatus, example: 'APPROVED' })
  status: ApplicationStatus;
}
