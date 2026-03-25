import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { Prisma } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('opportunities')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @ApiOperation({ summary: 'Create a new opportunity (Sponsors only in a real app)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sponsorId: { type: 'string' },
        title: { type: 'string', example: 'Software Engineering Internship' },
        description: { type: 'string', example: 'Great internship for women in tech.' },
        type: { type: 'string', example: 'Internship' },
      }
    }
  })
  @Post()
  create(@Body() data: Prisma.OpportunityUncheckedCreateInput) {
    return this.opportunitiesService.create(data);
  }

  @ApiOperation({ summary: 'Get all opportunities' })
  @Get()
  findAll() {
    return this.opportunitiesService.findAll();
  }

  @ApiOperation({ summary: 'Get a specific opportunity' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id);
  }

  @ApiOperation({ summary: 'Apply for an opportunity' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        opportunityId: { type: 'string' },
        applicantId: { type: 'string' },
        coverLetter: { type: 'string', example: 'I am highly interested...' }
      }
    }
  })
  @Post('apply')
  apply(@Body() data: Prisma.OpportunityApplicationUncheckedCreateInput) {
    return this.opportunitiesService.apply(data);
  }
}
