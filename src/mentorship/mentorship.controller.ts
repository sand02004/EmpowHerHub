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

  @ApiOperation({ summary: 'Get all mentors available for mentorship' })
  @Get('mentors')
  getMentors() {
    return this.mentorshipService.getAllMentors();
  }

  @ApiOperation({ summary: 'Get all mentorship applications (Admins)' })
  @Get()
  getAllApplications() {
    // Requires a quick inline prisma access for Admin mapping
    return this.mentorshipService['prisma'].client.mentorshipApplication.findMany({
      include: {
        mentor: { select: { firstName: true, lastName: true } },
        mentee: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @ApiOperation({ summary: 'Get all requests a mentee has sent' })
  @Get('mentee/:menteeId')
  getMenteeRequests(@Param('menteeId') menteeId: string) {
    return this.mentorshipService.getMenteeApplications(menteeId);
  }

  @ApiOperation({ summary: 'Get all requests a mentor has received' })
  @Get('mentor/:mentorId/requests')
  getMentorRequests(@Param('mentorId') mentorId: string) {
    return this.mentorshipService.getMentorApplications(mentorId);
  }

  @ApiOperation({ summary: 'Get all active mentees for a mentor' })
  @Get('mentor/:mentorId/mentees')
  getMentorMentees(@Param('mentorId') mentorId: string) {
    return this.mentorshipService.getMentorMentees(mentorId);
  }

  @ApiOperation({ summary: 'Approve or Reject a mentorship request' })
  @ApiBody({ type: UpdateMentorshipStatusDto })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateMentorshipStatusDto) {
    return this.mentorshipService.updateStatus(id, body.status);
  }
}
