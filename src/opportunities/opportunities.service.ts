import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Opportunity, OpportunityApplication } from '@prisma/client';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  // Create a new opportunity (Job, Grant, Internship)
  async create(data: Prisma.OpportunityUncheckedCreateInput): Promise<Opportunity> {
    return this.prisma.client.opportunity.create({ data });
  }

  // Get all active opportunities
  async findAll(): Promise<Opportunity[]> {
    return this.prisma.client.opportunity.findMany({
      include: { sponsor: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get a specific opportunity
  async findOne(id: string): Promise<Opportunity> {
    const opportunity = await this.prisma.client.opportunity.findUnique({
      where: { id },
      include: { sponsor: { select: { firstName: true, lastName: true } } },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');
    return opportunity;
  }

  // Apply for an opportunity
  async apply(data: Prisma.OpportunityApplicationUncheckedCreateInput): Promise<OpportunityApplication> {
    return this.prisma.client.opportunityApplication.create({ data });
  }

  // Get applicants for an opportunity
  async getApplications(opportunityId: string): Promise<any[]> {
    return this.prisma.client.opportunityApplication.findMany({
      where: { opportunityId },
      include: { applicant: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get applications for a specific user
  async getUserApplications(userId: string): Promise<any[]> {
    return this.prisma.client.opportunityApplication.findMany({
      where: { applicantId: userId },
      include: { opportunity: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Accept or Reject an application
  async updateApplicationStatus(id: string, status: any): Promise<any> {
    return this.prisma.client.opportunityApplication.update({
      where: { id },
      data: { status }
    });
  }
}
