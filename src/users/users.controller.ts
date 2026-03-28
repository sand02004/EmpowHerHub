import { Controller, Get, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { UpdateUserDto } from './users.dto';

@ApiTags('users') // This puts it in a neat "users" section in Swagger UI!
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get a list of all users' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Complete a user profile with role-specific data' })
  @Patch(':id/complete-profile')
  completeProfile(@Param('id') id: string, @Body() body: { role: string; payload: any }) {
    return this.usersService.completeProfile(id, body.role, body.payload);
  }

  @ApiOperation({ summary: 'Get notification badge count for a user' })
  @ApiParam({ name: 'id', description: 'The unique ID of the user' })
  @ApiParam({ name: 'role', description: 'The role of the user' })
  @Get(':id/notifications/:role')
  getNotificationBadge(@Param('id') id: string, @Param('role') role: string) {
    return this.usersService.getNotificationBadge(id, role);
  }

  @ApiOperation({ summary: 'Get a specific user by their Unique ID' })
  @ApiParam({ name: 'id', description: 'The unique ID of the user' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', description: 'The unique ID of the user to update' })
  @ApiBody({ type: UpdateUserDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.update(id, data);
  }

  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'The unique ID of the user to delete' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
