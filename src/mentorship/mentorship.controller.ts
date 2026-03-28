import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { ApplicationStatus } from '../common/prisma-types';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApplyMentorshipDto, UpdateMentorshipStatusDto, CreateMentorshipProgramDto } from './mentorship.dto';

@ApiTags('mentorship')
@Controller('mentorship')
export class MentorshipController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  @ApiOperation({ summary: 'Create a mentorship program (Mentors only)' })
  @ApiBody({ type: CreateMentorshipProgramDto })
  @Post('programs')
  createProgram(@Body() data: CreateMentorshipProgramDto, @Request() req: any) {
    // Note: In real app, we'd get mentorId from JWT. Using req.body for now if not guarded.
    const mentorId = data['mentorId'] || req.user?.id; 
    return this.mentorshipService.createProgram(mentorId, data);
  }

  @ApiOperation({ summary: 'Get all mentorship programs' })
  @Get('programs')
  getPrograms() {
    return this.mentorshipService.getAllPrograms();
  }

  @ApiOperation({ summary: 'Get programs created by a specific mentor' })
  @Get('programs/mentor/:mentorId')
  getMentorPrograms(@Param('mentorId') mentorId: string) {
    return this.mentorshipService.getMentorPrograms(mentorId);
  }

  @ApiOperation({ summary: 'Apply to a mentorship program or mentor' })
  @ApiBody({ type: ApplyMentorshipDto })
  @Post('apply')
  apply(@Body() data: ApplyMentorshipDto) {
    return this.mentorshipService.applyForMentorship(data);
  }

  @ApiOperation({ summary: 'Get all mentors available for mentorship (Legacy)' })
  @Get('mentors')
  getMentors() {
    return this.mentorshipService.getAllMentors();
  }

  @ApiOperation({ summary: 'Get all mentorship applications (Admins)' })
  @Get()
  getAllApplications() {
    // Returns [] until admin-specific query is added to service
    return [];
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
