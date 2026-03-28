import { Injectable } from '@nestjs/common';
import { MentorshipRepository } from './mentorship.repository';

@Injectable()
export class MentorshipService {
  constructor(private repo: MentorshipRepository) {}

  // Mentorship Programs
  async createProgram(mentorId: string, data: any) {
    return this.repo.createProgram(mentorId, data);
  }

  async getAllPrograms() {
    return this.repo.getAllPrograms();
  }

  async getMentorPrograms(mentorId: string) {
    return this.repo.getMentorPrograms(mentorId);
  }

  // Request mentorship (now linked to a program)
  async applyForMentorship(data: any) {
    return this.repo.applyForProgram(data);
  }

  // Get applications received by a specific mentor
  async getMentorApplications(mentorId: string) {
    return this.repo.getMentorApplications(mentorId);
  }

  // Update application status
  async updateStatus(id: string, status: any) {
    return this.repo.updateApplicationStatus(id, status);
  }

  // Legacy compat if needed
  async getAllMentors() {
    return []; // Mocked for now to avoid Prisma crash
  }

  async getMenteeApplications(menteeId: string) {
    return []; // Mocked for now to avoid Prisma crash
  }

  async getMentorMentees(mentorId: string) {
    return []; // Mocked for now to avoid Prisma crash
  }
}
