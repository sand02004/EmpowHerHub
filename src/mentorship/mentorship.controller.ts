import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { Prisma, ApplicationStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApplyMentorshipDto, UpdateMentorshipStatusDto } from './mentorship.dto';

@ApiTags('mentorship')
@Controller('mentorship')
export class MentorshipController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  @ApiOperation({ summary: 'Apply to be mentored by someone' })
  @ApiBody({ type: ApplyMentorshipDto })
  @Post('apply')
  apply(@Body() data: ApplyMentorshipDto) {
    return this.mentorshipService.applyForMentorship(data);
  }

  @ApiOperation({ summary: 'Get all requests a mentor has received' })
  @Get('mentor/:mentorId')
  getMentorRequests(@Param('mentorId') mentorId: string) {
    return this.mentorshipService.getMentorApplications(mentorId);
  }

  @ApiOperation({ summary: 'Approve or Reject a mentorship request' })
  @ApiBody({ type: UpdateMentorshipStatusDto })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateMentorshipStatusDto) {
    return this.mentorshipService.updateStatus(id, body.status);
  }
}
