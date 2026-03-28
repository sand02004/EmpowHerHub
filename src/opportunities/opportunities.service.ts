import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any): Promise<any> {
    try {
      const id = crypto.randomUUID();
      await this.prisma.client.$executeRaw`
        INSERT INTO "Opportunity" (id, title, type, description, requirements, deadline, "sponsorId", "createdAt", "updatedAt")
        VALUES (${id}, ${data.title}, ${data.type}, ${data.description}, ${data.requirements ?? null}, ${data.deadline ? new Date(data.deadline) : null}, ${data.sponsorId}, NOW(), NOW())
      `;
      const rows: any[] = await this.prisma.client.$queryRaw`SELECT * FROM "Opportunity" WHERE id = ${id}`;
      return rows[0];
    } catch(err: any) {
      console.log('SQL ERROR in OpportunitiesService.create:', err);
      throw new BadRequestException(err.message || String(err));
    }
  }

  async findAll(): Promise<any[]> {
    return this.prisma.client.$queryRaw`
      SELECT o.*, u."firstName" as "sponsorFirstName", u."lastName" as "sponsorLastName"
      FROM "Opportunity" o
      JOIN "User" u ON o."sponsorId" = u.id
      ORDER BY o."createdAt" DESC
    `;
  }

  async findBySponsor(sponsorId: string): Promise<any[]> {
    return this.prisma.client.$queryRaw`
      SELECT * FROM "Opportunity" WHERE "sponsorId" = ${sponsorId} ORDER BY "createdAt" DESC
    `;
  }

  async findOne(id: string): Promise<any> {
    const rows: any[] = await this.prisma.client.$queryRaw`
      SELECT o.*, u."firstName" as "sponsorFirstName", u."lastName" as "sponsorLastName"
      FROM "Opportunity" o
      JOIN "User" u ON o."sponsorId" = u.id
      WHERE o.id = ${id}
    `;
    if (!rows.length) throw new NotFoundException('Opportunity not found');
    return rows[0];
  }

  async apply(data: any): Promise<any> {
    const id = crypto.randomUUID();
    await this.prisma.client.$executeRaw`
      INSERT INTO "OpportunityApplication" (id, "opportunityId", "applicantId", "coverLetter", status, "createdAt")
      VALUES (${id}, ${data.opportunityId}, ${data.applicantId}, ${data.coverLetter ?? null}, 'PENDING'::"ApplicationStatus", NOW())
    `;
    const rows: any[] = await this.prisma.client.$queryRaw`SELECT * FROM "OpportunityApplication" WHERE id = ${id}`;
    return rows[0];
  }

  async getApplications(opportunityId: string): Promise<any[]> {
    return this.prisma.client.$queryRaw`
      SELECT a.*, u."firstName" as "applicantFirstName", u."lastName" as "applicantLastName"
      FROM "OpportunityApplication" a
      JOIN "User" u ON a."applicantId" = u.id
      WHERE a."opportunityId" = ${opportunityId}
      ORDER BY a."createdAt" DESC
    `;
  }

  async getUserApplications(userId: string): Promise<any[]> {
    return this.prisma.client.$queryRaw`
      SELECT a.*, o.title as "opportunityTitle", o.type as "opportunityType"
      FROM "OpportunityApplication" a
      JOIN "Opportunity" o ON a."opportunityId" = o.id
      WHERE a."applicantId" = ${userId}
      ORDER BY a."createdAt" DESC
    `;
  }

  async getSponsorApplications(sponsorId: string): Promise<any[]> {
    return this.prisma.client.$queryRaw`
      SELECT a.*, o.title as "opportunityTitle", u.id as "applicantId", u."firstName" as "applicantFirstName", u."lastName" as "applicantLastName"
      FROM "OpportunityApplication" a
      JOIN "Opportunity" o ON a."opportunityId" = o.id
      JOIN "User" u ON a."applicantId" = u.id
      WHERE o."sponsorId" = ${sponsorId}
      ORDER BY a."createdAt" DESC
    `;
  }

  async updateApplicationStatus(id: string, status: string): Promise<any> {
    await this.prisma.client.$executeRaw`
      UPDATE "OpportunityApplication" SET status = ${status}::"ApplicationStatus" WHERE id = ${id}
    `;
    const rows: any[] = await this.prisma.client.$queryRaw`SELECT * FROM "OpportunityApplication" WHERE id = ${id}`;
    return rows[0];
  }
}
