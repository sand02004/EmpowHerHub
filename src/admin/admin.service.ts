import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingAccounts() {
    const users: any[] = await this.prisma.client.$queryRaw`
      SELECT id, email, "firstName", "lastName", role, "accountStatus", "createdAt"
      FROM "User"
      WHERE "accountStatus" = 'PENDING'::"AccountStatus" OR "accountStatus" = 'IN_REVIEW'::"AccountStatus"
      ORDER BY "createdAt" DESC
    `;
    return users.map(u => ({ ...u, status: u.accountStatus }));
  }

  async updateAccountStatus(userId: string, status: string) {
    const rows: any[] = await this.prisma.client.$queryRaw`
      SELECT id FROM "User" WHERE id = ${userId}
    `;
    if (!rows.length) throw new NotFoundException('User not found');

    await this.prisma.client.$executeRaw`
      UPDATE "User" SET "accountStatus" = ${status}::"AccountStatus", "updatedAt" = NOW() WHERE id = ${userId}
    `;
    const updated: any[] = await this.prisma.client.$queryRaw`
      SELECT * FROM "User" WHERE id = ${userId}
    `;
    return updated[0];
  }
}
