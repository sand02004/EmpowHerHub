import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './messages.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    const rows: any[] = await this.prisma.client.$queryRaw`
      SELECT 
        c.id, c."user1Id", c."user2Id", c."createdAt", c."updatedAt",
        u1.id as "u1_id", u1."firstName" as "u1_firstName", u1."lastName" as "u1_lastName", u1.role as "u1_role",
        u2.id as "u2_id", u2."firstName" as "u2_firstName", u2."lastName" as "u2_lastName", u2.role as "u2_role",
        (SELECT m.content FROM "Message" m WHERE m."conversationId" = c.id ORDER BY m."createdAt" DESC LIMIT 1) as "lastMessage",
        (SELECT m."createdAt" FROM "Message" m WHERE m."conversationId" = c.id ORDER BY m."createdAt" DESC LIMIT 1) as "lastMessageTime"
      FROM "Conversation" c
      JOIN "User" u1 ON c."user1Id" = u1.id
      JOIN "User" u2 ON c."user2Id" = u2.id
      WHERE c."user1Id" = ${userId} OR c."user2Id" = ${userId}
      ORDER BY c."updatedAt" DESC
    `;

    return rows.map(r => ({
      id: r.id,
      user1Id: r.user1Id,
      user2Id: r.user2Id,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user1: { id: r.u1_id, firstName: r.u1_firstName, lastName: r.u1_lastName, role: r.u1_role },
      user2: { id: r.u2_id, firstName: r.u2_firstName, lastName: r.u2_lastName, role: r.u2_role },
      lastMessage: r.lastMessage,
      lastMessageTime: r.lastMessageTime,
    }));
  }

  async getMessages(conversationId: string, userId: string) {
    const convRows: any[] = await this.prisma.client.$queryRaw`
      SELECT * FROM "Conversation" WHERE id = ${conversationId}
    `;

    if (!convRows.length) throw new NotFoundException('Conversation not found');
    const conv = convRows[0];
    if (conv.user1Id !== userId && conv.user2Id !== userId) {
      throw new NotFoundException('Conversation not found');
    }

    const messages: any[] = await this.prisma.client.$queryRaw`
      SELECT m.*, u.id as "senderId", u."firstName" as "senderFirstName", u."lastName" as "senderLastName", u.role as "senderRole"
      FROM "Message" m
      JOIN "User" u ON m."senderId" = u.id
      WHERE m."conversationId" = ${conversationId}
      ORDER BY m."createdAt" ASC
    `;

    return messages.map(m => ({
      ...m,
      sender: { id: m.senderId, firstName: m.senderFirstName, lastName: m.senderLastName, role: m.senderRole }
    }));
  }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    const [user1Id, user2Id] = [senderId, dto.receiverId].sort();

    // Find or create conversation
    let convRows: any[] = await this.prisma.client.$queryRaw`
      SELECT * FROM "Conversation" WHERE "user1Id" = ${user1Id} AND "user2Id" = ${user2Id}
    `;

    let conversationId: string;

    if (!convRows.length) {
      const newId = crypto.randomUUID();
      await this.prisma.client.$executeRaw`
        INSERT INTO "Conversation" (id, "user1Id", "user2Id", "createdAt", "updatedAt")
        VALUES (${newId}, ${user1Id}, ${user2Id}, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `;
      conversationId = newId;
    } else {
      conversationId = convRows[0].id;
    }

    const msgId = crypto.randomUUID();
    await this.prisma.client.$executeRaw`
      INSERT INTO "Message" (id, "conversationId", "senderId", content, "isRead", "createdAt")
      VALUES (${msgId}, ${conversationId}, ${senderId}, ${dto.content}, false, NOW())
    `;

    await this.prisma.client.$executeRaw`
      UPDATE "Conversation" SET "updatedAt" = NOW() WHERE id = ${conversationId}
    `;

    const msgRows: any[] = await this.prisma.client.$queryRaw`
      SELECT m.*, u.id as "senderId", u."firstName" as "senderFirstName", u."lastName" as "senderLastName", u.role as "senderRole"
      FROM "Message" m
      JOIN "User" u ON m."senderId" = u.id
      WHERE m.id = ${msgId}
    `;

    const m = msgRows[0];
    return {
      ...m,
      sender: { id: m.senderId, firstName: m.senderFirstName, lastName: m.senderLastName, role: m.senderRole }
    };
  }
}
