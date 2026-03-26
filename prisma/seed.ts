import { Role, AccountStatus, MentorshipType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { prisma } from './client';

async function main() {
  console.log('Starting execution of role seeders...');

  // Using a universally simple password for testing the UI flow manually
  const plainPassword = 'password123';
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

  console.log('1. Upserting Admin Role...');
  await prisma.user.upsert({
    where: { email: 'admin@empowher.com' },
    update: {},
    create: {
      email: 'admin@empowher.com',
      firstName: 'System',
      lastName: 'Admin',
      passwordHash,
      role: Role.ADMIN,
      accountStatus: AccountStatus.APPROVED,
      adminProfile: {
        create: {
          department: 'Platform Operation'
        }
      }
    }
  });

  console.log('2. Upserting Woman (Mentee) Role...');
  await prisma.user.upsert({
    where: { email: 'woman@empowher.com' },
    update: {},
    create: {
      email: 'woman@empowher.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      passwordHash,
      role: Role.WOMAN,
      accountStatus: AccountStatus.APPROVED, // Pre-approved for instant testing
      womenProfile: {
        create: {
          skills: ['JavaScript', 'React', 'TypeScript'],
          careerGoals: 'To become a highly skilled Full-Stack Developer passing all technical exams.'
        }
      }
    }
  });

  console.log('3. Upserting Mentor Role...');
  await prisma.user.upsert({
    where: { email: 'mentor@empowher.com' },
    update: {},
    create: {
      email: 'mentor@empowher.com',
      firstName: 'Grace',
      lastName: 'Hopper',
      passwordHash,
      role: Role.MENTOR,
      accountStatus: AccountStatus.APPROVED,
      mentorProfile: {
        create: {
          jobTitle: 'Senior Tech Lead',
          company: 'Tech Corp Innovation',
          yearsExperience: 10,
          professionalBackground: 'Mentoring junior developers and managing massive scale system architectures for 5 years.',
          mentorshipType: MentorshipType.ONLINE,
          expertiseAreas: ['System Architecture', 'Backend', 'Leadership'],
        }
      }
    }
  });

  console.log('4. Upserting Sponsor Role...');
  await prisma.user.upsert({
    where: { email: 'sponsor@empowher.com' },
    update: {},
    create: {
      email: 'sponsor@empowher.com',
      firstName: 'Emma',
      lastName: 'Watson',
      passwordHash,
      role: Role.SPONSOR,
      accountStatus: AccountStatus.APPROVED,
      sponsorProfile: {
        create: {
          organizationName: 'Women In Tech Foundation',
          description: 'A global foundation aiming to radically bridge the gender gap in technological ecosystems.',
          industry: 'Non-Profit / Education'
        }
      }
    }
  });

  console.log('✅ Database Seeding Complete! Roles created exactly as requested.');
  console.log(`Universal Test Login Password: ${plainPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ SEEDING ERROR:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
