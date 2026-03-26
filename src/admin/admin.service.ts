import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingAccounts() {
    return this.prisma.client.user.findMany({
      where: {
        accountStatus: { in: [AccountStatus.PENDING, AccountStatus.IN_REVIEW] }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      }
    });
  }

  async updateAccountStatus(userId: string, status: AccountStatus) {
    const user = await this.prisma.client.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.client.user.update({
      where: { id: userId },
      data: { accountStatus: status }
    });
  }
}
