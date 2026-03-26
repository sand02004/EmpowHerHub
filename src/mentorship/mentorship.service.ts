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

  // Get all available mentors
  async getAllMentors(): Promise<any[]> {
    return this.prisma.client.mentorProfile.findMany({
      include: { user: { select: { firstName: true, lastName: true } } }
    });
  }

  // Get applications sent by a specific mentee (Woman)
  async getMenteeApplications(menteeId: string): Promise<MentorshipApplication[]> {
    return this.prisma.client.mentorshipApplication.findMany({
      where: { menteeId },
      include: { mentor: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get applications received by a specific mentor
  async getMentorApplications(mentorId: string): Promise<MentorshipApplication[]> {
    return this.prisma.client.mentorshipApplication.findMany({
      where: { mentorId },
      include: { mentee: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Update application status and conditionally create the actual Mentorship session
  async updateStatus(id: string, status: ApplicationStatus): Promise<MentorshipApplication> {
    const application = await this.prisma.client.mentorshipApplication.update({
      where: { id },
      data: { status },
    });

    if (status === 'APPROVED') {
      // Check if Mentorship already exists to prevent duplicates
      const existing = await this.prisma.client.mentorship.findFirst({
        where: { mentorId: application.mentorId, menteeId: application.menteeId }
      });
      
      if (!existing) {
        await this.prisma.client.mentorship.create({
          data: {
            mentorId: application.mentorId,
            menteeId: application.menteeId,
          }
        });
      }
    }

    return application;
  }

  // Get active mentees for a mentor
  async getMentorMentees(mentorId: string): Promise<any[]> {
    return this.prisma.client.mentorship.findMany({
      where: { mentorId },
      include: { mentee: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}
