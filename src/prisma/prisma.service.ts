import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma } from '../../prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly client = prisma;

  async onModuleInit() {
    console.log('NestJS initialized with custom Prisma Pg Adapter');
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
