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
}
