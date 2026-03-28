import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MentorshipRepository {
  constructor(private prisma: PrismaService) {}

  async createProgram(mentorId: string, data: any) {
    const id = crypto.randomUUID();
    await this.prisma.client.$executeRaw`
      INSERT INTO "MentorshipProgram" ("id", "mentorId", "title", "description", "slots", "duration", "status", "createdAt", "updatedAt")
      VALUES (${id}, ${mentorId}, ${data.title}, ${data.description}, ${data.slots || 5}, ${data.duration}, 'OPEN', NOW(), NOW())
    `;
    return this.getProgramById(id);
  }

  async getProgramById(id: string) {
    const results: any[] = await this.prisma.client.$queryRaw`
      SELECT p.*, u."firstName", u."lastName"
      FROM "MentorshipProgram" p
      JOIN "User" u ON p."mentorId" = u."id"
      WHERE p."id" = ${id}
    `;
    return results[0];
  }

  async getAllPrograms() {
    return this.prisma.client.$queryRaw`
      SELECT p.*, u."firstName" as "mentorFirstName", u."lastName" as "mentorLastName"
      FROM "MentorshipProgram" p
      JOIN "User" u ON p."mentorId" = u."id"
      ORDER BY p."createdAt" DESC
    `;
  }

  async getMentorPrograms(mentorId: string) {
    return this.prisma.client.$queryRaw`
      SELECT p.*, (SELECT COUNT(*) FROM "MentorshipApplication" a WHERE a."programId" = p."id") as "applicationCount"
      FROM "MentorshipProgram" p
      WHERE p."mentorId" = ${mentorId}
      ORDER BY p."createdAt" DESC
    `;
  }

  async applyForProgram(data: any) {
    const id = crypto.randomUUID();
    await this.prisma.client.$executeRaw`
      INSERT INTO "MentorshipApplication" ("id", "programId", "mentorId", "menteeId", "message", "status", "createdAt")
      VALUES (${id}, ${data.programId}, ${data.mentorId}, ${data.menteeId}, ${data.message}, 'PENDING', NOW())
    `;
    return { id, ...data, status: 'PENDING' };
  }

  async getMentorApplications(mentorId: string) {
    return this.prisma.client.$queryRaw`
      SELECT a.*, u."firstName" as "menteeFirstName", u."lastName" as "menteeLastName", u."email" as "menteeEmail"
      FROM "MentorshipApplication" a
      JOIN "User" u ON a."menteeId" = u."id"
      WHERE a."mentorId" = ${mentorId}
      ORDER BY a."createdAt" DESC
    `;
  }

  async updateApplicationStatus(id: string, status: string) {
    await this.prisma.client.$executeRaw`
      UPDATE "MentorshipApplication" SET "status" = ${status}::"ApplicationStatus" WHERE "id" = ${id}
    `;
    
    if (status === 'APPROVED') {
      const app: any = await this.prisma.client.$queryRaw`SELECT * FROM "MentorshipApplication" WHERE "id" = ${id}`;
      if (app[0]) {
        const mId = crypto.randomUUID();
        await this.prisma.client.$executeRaw`
          INSERT INTO "Mentorship" ("id", "programId", "mentorId", "menteeId", "startDate")
          VALUES (${mId}, ${app[0].programId}, ${app[0].mentorId}, ${app[0].menteeId}, NOW())
          ON CONFLICT DO NOTHING
        `;
      }
    }
    return { id, status };
  }
}
