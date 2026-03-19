import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

// Set up the modern connection pool logic for Prisma 7
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding the database...');

  // 1. Create the Super Admin Account
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@empowher.com' },
    update: {},
    create: {
      email: 'admin@empowher.com',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      accountStatus: 'APPROVED', // Admin is auto-approved!
    },
  });
  console.log('Admin user created:', admin.email);

  // 2. Create the default Skills Assessment Test
  const existingTest = await prisma.test.findFirst();
  
  if (!existingTest) {
    const defaultTest = await prisma.test.create({
      data: {
        title: 'Basic Tech Skills Assessment',
        description: 'A mandatory test for new women joining the platform.',
        passingScore: 60,
        questions: {
          create: [
            {
              content: 'What does HTML stand for?',
              answerOptions: {
                create: [
                  { content: 'Hyper Text Markup Language', isCorrect: true },
                  { content: 'Hyperlinks and Text Markup Language', isCorrect: false },
                  { content: 'Home Tool Markup Language', isCorrect: false },
                ],
              },
            },
            {
              content: 'Which language is used for styling web pages?',
              answerOptions: {
                create: [
                  { content: 'HTML', isCorrect: false },
                  { content: 'CSS', isCorrect: true },
                  { content: 'Python', isCorrect: false },
                ],
              },
            },
          ],
        },
      },
    });
    console.log('Default Skills Test created:', defaultTest.title);
  } else {
    console.log('Test already exists. Skipping...');
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
