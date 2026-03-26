import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Used for logging in
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({
      where: { email },
    });
  }

  // Used for registering
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.client.user.create({
      data,
    });
  }

  // Get all users (Includes their specific profiles if they have one)
  async findAll(): Promise<User[]> {
    return this.prisma.client.user.findMany({
      include: {
        womenProfile: true,
        mentorProfile: true,
        sponsorProfile: true,
      }
    });
  }

  // Get a specific user by ID
  async findOne(id: string): Promise<User> {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      include: {
        womenProfile: true,
        mentorProfile: true,
        sponsorProfile: true,
      }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Update a user (e.g., changing their name or phone number)
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.client.user.update({
      where: { id },
      data,
    });
  }

  // Delete a user entirely
  async remove(id: string): Promise<User> {
    return this.prisma.client.user.delete({
      where: { id },
    });
  }

  // Complete profile by updating role-specific tables and pushing status to IN_REVIEW
  async completeProfile(id: string, role: string, payload: any): Promise<User> {
    const data: any = {};
    if (role === 'WOMAN') {
      data.womenProfile = { update: { ...payload } };
    } else if (role === 'MENTOR') {
      data.mentorProfile = { update: { ...payload } };
    } else if (role === 'SPONSOR') {
      data.sponsorProfile = { update: { ...payload } };
    }
    
    return this.prisma.client.user.update({
      where: { id },
      data: {
        ...data,
        accountStatus: 'IN_REVIEW'
      }
    });
  }
}
