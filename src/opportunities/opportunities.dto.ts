import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOpportunityDto {
  @ApiProperty({ example: 'uuid-here' })
  sponsorId: string;

  @ApiProperty({ example: 'Software Engineering Internship' })
  title: string;

  @ApiProperty({ example: 'Great internship for women in tech.' })
  description: string;

  @ApiProperty({ example: 'Internship' })
  type: string;

  @ApiPropertyOptional({ example: 'Remote or Kigali' })
  location?: string;

  @ApiPropertyOptional({ example: true })
  isRemote?: boolean;
}

export class ApplyOpportunityDto {
  @ApiProperty({ example: 'uuid-here' })
  opportunityId: string;

  @ApiProperty({ example: 'uuid-here' })
  applicantId: string;

  @ApiPropertyOptional({ example: 'I am highly interested...' })
  coverLetter?: string;

  @ApiPropertyOptional({ example: 'https://link-to-resume.com' })
  resumeUrl?: string;
}
