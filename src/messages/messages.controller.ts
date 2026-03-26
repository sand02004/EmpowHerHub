import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './messages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for the authenticated user' })
  getConversations(@Request() req) {
    return this.messagesService.getConversations(req.user.sub);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get all messages in a specific conversation' })
  getMessages(@Param('id') id: string, @Request() req) {
    return this.messagesService.getMessages(id, req.user.sub);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send a message' })
  sendMessage(@Body() dto: SendMessageDto, @Request() req) {
    return this.messagesService.sendMessage(req.user.sub, dto);
  }
}
