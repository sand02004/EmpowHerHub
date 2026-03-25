import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { Prisma, ApplicationStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('mentorship')
@Controller('mentorship')
export class MentorshipController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  @ApiOperation({ summary: 'Apply to be mentored by someone' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mentorId: { type: 'string' },
        menteeId: { type: 'string' },
        message: { type: 'string', example: 'I admire your work and would love mentorship!' },
      }
    }
  })
  @Post('apply')
  apply(@Body() data: Prisma.MentorshipApplicationUncheckedCreateInput) {
    return this.mentorshipService.applyForMentorship(data);
  }

  @ApiOperation({ summary: 'Get all requests a mentor has received' })
  @Get('mentor/:mentorId')
  getMentorRequests(@Param('mentorId') mentorId: string) {
    return this.mentorshipService.getMentorApplications(mentorId);
  }

  @ApiOperation({ summary: 'Approve or Reject a mentorship request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { status: { type: 'string', example: 'APPROVED' } }
    }
  })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: ApplicationStatus) {
    return this.mentorshipService.updateStatus(id, status);
  }
}
