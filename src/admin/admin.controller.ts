import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
export enum Role {
  WOMAN = 'WOMAN',
  MENTOR = 'MENTOR',
  SPONSOR = 'SPONSOR',
  ADMIN = 'ADMIN',
}

export enum AccountStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_REVIEW = 'IN_REVIEW',
}
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get all pending account registrations' })
  @Get('pending-accounts')
  getPendingAccounts() {
    return this.adminService.getPendingAccounts();
  }

  @ApiOperation({ summary: 'Approve or Reject an account' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', example: 'APPROVED' } } } })
  @Patch('account/:id/status')
  updateAccountStatus(
    @Param('id') id: string,
    @Body('status') status: AccountStatus
  ) {
    return this.adminService.updateAccountStatus(id, status);
  }
}
