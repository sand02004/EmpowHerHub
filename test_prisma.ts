import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  url: process.env.DATABASE_URL
} as any);

async function test() {
  console.log('Testing...');
  try {
    const user = await prisma.user.findFirst();
    console.log('User found:', user);
  } catch (e) {
    console.error('Error finding user', e);
  }
}

test().catch(e => console.error(e)).finally(() => prisma.$disconnect());
