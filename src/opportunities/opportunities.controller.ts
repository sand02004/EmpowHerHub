import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { Prisma } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CreateOpportunityDto, ApplyOpportunityDto } from './opportunities.dto';

@ApiTags('opportunities')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @ApiOperation({ summary: 'Create a new opportunity (Sponsors only in a real app)' })
  @ApiBody({ type: CreateOpportunityDto })
  @Post()
  create(@Body() data: CreateOpportunityDto) {
    return this.opportunitiesService.create(data);
  }

  @ApiOperation({ summary: 'Get all opportunities' })
  @Get()
  findAll() {
    return this.opportunitiesService.findAll();
  }

  @ApiOperation({ summary: 'Get opportunities by sponsor' })
  @Get('sponsor/:sponsorId')
  findBySponsor(@Param('sponsorId') sponsorId: string) {
    return this.opportunitiesService.findBySponsor(sponsorId);
  }

  @ApiOperation({ summary: 'Get a specific opportunity' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id);
  }

  @ApiOperation({ summary: 'Apply for an opportunity' })
  @ApiBody({ type: ApplyOpportunityDto })
  @Post('apply')
  apply(@Body() data: ApplyOpportunityDto) {
    return this.opportunitiesService.apply(data);
  }

  @ApiOperation({ summary: 'Get applicants for an opportunity' })
  @Get(':id/applications')
  getApplications(@Param('id') id: string) {
    return this.opportunitiesService.getApplications(id);
  }

  @ApiOperation({ summary: 'Get applications submitted by a user' })
  @Get('user-applications/:userId')
  getUserApplications(@Param('userId') userId: string) {
    return this.opportunitiesService.getUserApplications(userId);
  }

  @ApiOperation({ summary: 'Get all applications for a sponsor' })
  @Get('sponsor/:sponsorId/applications')
  getSponsorApplications(@Param('sponsorId') sponsorId: string) {
    return this.opportunitiesService.getSponsorApplications(sponsorId);
  }

  @ApiOperation({ summary: 'Update application status (ACCEPT/REJECT)' })
  @Post('applications/:id/status')
  updateApplicationStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.opportunitiesService.updateApplicationStatus(id, status);
  }
}
