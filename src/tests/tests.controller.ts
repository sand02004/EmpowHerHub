import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto, SubmitTestDto } from './dto/create-test.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active tests' })
  findAll() {
    return this.testsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific test' })
  findOne(@Param('id') id: string) {
    return this.testsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new test (Admin only)' })
  create(@Body() createTestDto: CreateTestDto) {
    return this.testsService.create(createTestDto);
  }

  @Post(':id/submit')
  @Roles(Role.WOMAN)
  @ApiOperation({ summary: 'Submit answers for a test (Women only)' })
  submit(@Param('id') id: string, @Body() submitTestDto: SubmitTestDto, @Request() req) {
    return this.testsService.submitTest(req.user.sub, id, submitTestDto);
  }
}
