import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class ApplyMentorshipDto {
  @ApiPropertyOptional({ description: 'ID of the mentorship program' })
  programId?: string;

  @ApiProperty({ description: 'ID of the mentor', example: 'uuid-here' })
  mentorId: string;

  @ApiProperty({ description: 'ID of the mentee applying', example: 'uuid-here' })
  menteeId: string;

  @ApiPropertyOptional({ example: 'I admire your work and would love mentorship!' })
  message?: string;
}

export class CreateMentorshipProgramDto {
  @ApiProperty({ example: 'Advancing Women in Cloud Computing' })
  title: string;

  @ApiProperty({ example: 'A deep dive into serverless and microservices.' })
  description: string;

  @ApiPropertyOptional({ example: 5 })
  slots?: number;

  @ApiPropertyOptional({ example: '3 months' })
  duration?: string;
}

export class UpdateMentorshipStatusDto {
  @ApiProperty({ enum: ApplicationStatus, example: 'APPROVED' })
  status: ApplicationStatus;
}
