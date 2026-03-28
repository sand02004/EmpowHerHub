import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Used for logging in
  async findByEmail(email: string): Promise<any | null> {
    const rows: any[] = await this.prisma.client.$queryRaw`
      SELECT * FROM "User" WHERE email = ${email}
    `;
    return rows[0] || null;
  }

  // Used for registering
  async createUser(data: any): Promise<any> {
    const id = crypto.randomUUID();
    await this.prisma.client.$executeRaw`
      INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", "phoneNumber", role, "accountStatus", "organizationName", "createdAt", "updatedAt")
      VALUES (${id}, ${data.email}, ${data.passwordHash}, ${data.firstName}, ${data.lastName}, ${data.phoneNumber ?? null}, ${data.role ?? 'WOMAN'}::"Role", ${data.accountStatus ?? 'PENDING'}::"AccountStatus", ${data.organizationName ?? null}, NOW(), NOW())
    `;

    // Create role-specific profile
    const profileId = crypto.randomUUID();
    if (data.role === 'MENTOR') {
      await this.prisma.client.$executeRaw`
        INSERT INTO "MentorProfile" (id, "userId", "yearsExperience", "expertiseAreas", "mentorshipTopics")
        VALUES (${profileId}, ${id}, 0, ARRAY[]::text[], ARRAY[]::text[])
        ON CONFLICT DO NOTHING
      `;
    } else if (data.role === 'WOMAN') {
      await this.prisma.client.$executeRaw`
        INSERT INTO "WomenProfile" (id, "userId", skills, "skillsToDevelop")
        VALUES (${profileId}, ${id}, ARRAY[]::text[], ARRAY[]::text[])
        ON CONFLICT DO NOTHING
      `;
    } else if (data.role === 'SPONSOR') {
      await this.prisma.client.$executeRaw`
        INSERT INTO "SponsorProfile" (id, "userId", "organizationName")
        VALUES (${profileId}, ${id}, ${data.organizationName ?? 'N/A'})
        ON CONFLICT DO NOTHING
      `;
    }

    return this.findById(id);
  }

  async findById(id: string): Promise<any> {
    const rows: any[] = await this.prisma.client.$queryRaw`
      SELECT * FROM "User" WHERE id = ${id}
    `;
    return rows[0] || null;
  }

  // Get all users
  async findAll(): Promise<any[]> {
    return this.prisma.client.$queryRaw`SELECT id, email, "firstName", "lastName", role, "accountStatus", "createdAt" FROM "User" ORDER BY "createdAt" DESC`;
  }

  // Get a specific user by ID
  async findOne(id: string): Promise<any> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  // Update a user
  async update(id: string, data: any): Promise<any> {
    const fields = Object.entries(data)
      .filter(([_, v]) => v !== undefined)
      .map(([k]) => k);

    if (!fields.length) return this.findById(id);

    // Build SQL - we do individual column updates for safety
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      if (key === 'firstName') {
        await this.prisma.client.$executeRaw`UPDATE "User" SET "firstName" = ${value} WHERE id = ${id}`;
      } else if (key === 'lastName') {
        await this.prisma.client.$executeRaw`UPDATE "User" SET "lastName" = ${value} WHERE id = ${id}`;
      } else if (key === 'phoneNumber') {
        await this.prisma.client.$executeRaw`UPDATE "User" SET "phoneNumber" = ${value} WHERE id = ${id}`;
      } else if (key === 'accountStatus') {
        await this.prisma.client.$executeRaw`UPDATE "User" SET "accountStatus" = ${value}::"AccountStatus" WHERE id = ${id}`;
      } else if (key === 'role') {
        await this.prisma.client.$executeRaw`UPDATE "User" SET role = ${value}::"Role" WHERE id = ${id}`;
      }
    }
    await this.prisma.client.$executeRaw`UPDATE "User" SET "updatedAt" = NOW() WHERE id = ${id}`;
    return this.findById(id);
  }

  // Delete a user
  async remove(id: string): Promise<any> {
    const user = await this.findById(id);
    await this.prisma.client.$executeRaw`DELETE FROM "User" WHERE id = ${id}`;
    return user;
  }

  // Complete profile
  async completeProfile(id: string, role: string, payload: any): Promise<any> {
    const normalizedRole = role.toLowerCase();

    if (normalizedRole === 'woman') {
      if (payload.phone) await this.prisma.client.$executeRaw`UPDATE "User" SET "phoneNumber" = ${payload.phone} WHERE id = ${id}`;
      await this.prisma.client.$executeRaw`
        UPDATE "WomenProfile" SET
          "dateOfBirth" = ${payload.dob ? new Date(payload.dob) : null},
          country = ${payload.country ?? null},
          city = ${payload.city ?? null},
          "educationLevel" = ${payload.educationLevel ?? null},
          "areaOfInterest" = ${payload.areaOfInterest ?? null},
          "careerGoals" = ${payload.careerGoals ?? null}
        WHERE "userId" = ${id}
      `;
    } else if (normalizedRole === 'mentor') {
      if (payload.firstName) await this.prisma.client.$executeRaw`UPDATE "User" SET "firstName" = ${payload.firstName} WHERE id = ${id}`;
      if (payload.lastName) await this.prisma.client.$executeRaw`UPDATE "User" SET "lastName" = ${payload.lastName} WHERE id = ${id}`;
      if (payload.phone) await this.prisma.client.$executeRaw`UPDATE "User" SET "phoneNumber" = ${payload.phone} WHERE id = ${id}`;
      await this.prisma.client.$executeRaw`
        UPDATE "MentorProfile" SET
          "jobTitle" = ${payload.jobTitle ?? null},
          company = ${payload.company ?? null},
          industry = ${payload.industry ?? null},
          "yearsExperience" = ${parseInt(payload.yearsExperience?.toString() ?? '0') || 0},
          "professionalBackground" = ${payload.professionalBackground ?? payload.background ?? null},
          "availableHours" = ${payload.availableHours?.toString() ?? null}
        WHERE "userId" = ${id}
      `;
    } else if (normalizedRole === 'sponsor') {
      await this.prisma.client.$executeRaw`
        UPDATE "SponsorProfile" SET
          "organizationName" = ${payload.organizationName ?? 'N/A'},
          description = ${payload.description ?? payload.additionalInfo ?? null},
          industry = ${payload.industry ?? payload.sponsorIndustry ?? null},
          website = ${payload.website ?? payload.websiteUrl ?? null}
        WHERE "userId" = ${id}
      `;
    }

    await this.prisma.client.$executeRaw`UPDATE "User" SET "accountStatus" = 'IN_REVIEW'::"AccountStatus", "updatedAt" = NOW() WHERE id = ${id}`;
    return this.findById(id);
  }

  // Get notification badge count
  async getNotificationBadge(id: string, role: string): Promise<number> {
    let count = 0;
    
    // Unread messages for ALL users
    const messages: any[] = await this.prisma.client.$queryRaw`
      SELECT COUNT(*)::int as count 
      FROM "Message" m 
      JOIN "Conversation" c ON m."conversationId" = c.id
      WHERE (c."user1Id" = ${id} OR c."user2Id" = ${id})
        AND m."senderId" != ${id}
        AND m."isRead" = false
    `;
    count += (messages[0]?.count || 0);

    const normalizedRole = role.toLowerCase();
    
    if (normalizedRole === 'admin') {
      const pending: any[] = await this.prisma.client.$queryRaw`
        SELECT COUNT(*)::int as count FROM "User" WHERE "accountStatus" = 'PENDING'::"AccountStatus" OR "accountStatus" = 'IN_REVIEW'::"AccountStatus"
      `;
      count += (pending[0]?.count || 0);
    } else if (normalizedRole === 'mentor') {
      const reqs: any[] = await this.prisma.client.$queryRaw`
        SELECT COUNT(*)::int as count FROM "MentorshipApplication" WHERE "mentorId" = ${id} AND status = 'PENDING'::"MentorshipStatus"
      `;
      count += (reqs[0]?.count || 0);
    } else if (normalizedRole === 'sponsor') {
      const apps: any[] = await this.prisma.client.$queryRaw`
        SELECT COUNT(*)::int as count 
        FROM "OpportunityApplication" a 
        JOIN "Opportunity" o ON a."opportunityId" = o.id
        WHERE o."sponsorId" = ${id} AND a.status = 'PENDING'::"ApplicationStatus"
      `;
      count += (apps[0]?.count || 0);
    }

    return count;
  }
}
