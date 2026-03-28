import 'dotenv/config';
import prisma from './prisma/client';

async function test() {
  console.log('Testing...');
  try {
    const user = await prisma.$queryRaw`SELECT * FROM "User" LIMIT 1`;
    console.log('User found:', user);
  } catch (e) {
    console.error('Error finding user', e);
  }
}

test().catch(e => console.error(e)).finally(() => prisma.$disconnect());
