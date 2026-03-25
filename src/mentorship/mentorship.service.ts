import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, MentorshipApplication, ApplicationStatus } from '@prisma/client';

@Injectable()
export class MentorshipService {
  constructor(private prisma: PrismaService) {}

  // Request mentorship
  async applyForMentorship(data: Prisma.MentorshipApplicationUncheckedCreateInput): Promise<MentorshipApplication> {
    return this.prisma.client.mentorshipApplication.create({ data });
  }

  // Get applications received by a specific mentor
  async getMentorApplications(mentorId: string): Promise<MentorshipApplication[]> {
    return this.prisma.client.mentorshipApplication.findMany({
      where: { mentorId },
      include: { mentee: { select: { firstName: true, lastName: true, email: true } } },
    });
  }

  // Update application status (Approve or Reject)
  async updateStatus(id: string, status: ApplicationStatus): Promise<MentorshipApplication> {
    return this.prisma.client.mentorshipApplication.update({
      where: { id },
      data: { status },
    });
  }
}
