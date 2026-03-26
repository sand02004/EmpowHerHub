import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './messages.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    return this.prisma.client.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: { select: { id: true, firstName: true, lastName: true, role: true } },
        user2: { select: { id: true, firstName: true, lastName: true, role: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getMessages(conversationId: string, userId: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
      throw new NotFoundException('Conversation not found');
    }

    return this.prisma.client.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } }
      }
    });
  }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    // Determine user1 and user2 so the unique constraint works consistently (sort by ID)
    const [user1Id, user2Id] = [senderId, dto.receiverId].sort();

    let conversation = await this.prisma.client.conversation.findUnique({
      where: {
        user1Id_user2Id: { user1Id, user2Id }
      }
    });

    if (!conversation) {
      conversation = await this.prisma.client.conversation.create({
        data: { user1Id, user2Id }
      });
    }

    const message = await this.prisma.client.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        content: dto.content
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } }
      }
    });

    await this.prisma.client.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    return message;
  }
}
