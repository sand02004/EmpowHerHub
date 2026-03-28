import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from './client';

async function upsertUser(email: string, data: any, profileType: string, profileData: any) {
  const existing: any[] = await prisma.$queryRaw`SELECT id FROM "User" WHERE email = ${email}`;
  let userId;
  if (existing.length > 0) {
    userId = existing[0].id;
    console.log(`User ${email} already exists as ID ${userId}`);
  } else {
    userId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "User" ("id", "email", "firstName", "lastName", "passwordHash", "role", "accountStatus", "createdAt", "updatedAt")
      VALUES (${userId}, ${email}, ${data.firstName}, ${data.lastName}, ${data.passwordHash}, ${data.role}::"Role", ${data.accountStatus}::"AccountStatus", NOW(), NOW())
    `;

    const profileId = crypto.randomUUID();
    if (profileType === 'adminProfile') {
      await prisma.$executeRaw`
        INSERT INTO "AdminProfile" ("id", "userId", "department")
        VALUES (${profileId}, ${userId}, ${profileData.department})
      `;
    } else if (profileType === 'womenProfile') {
      const skillsArray = '{' + profileData.skills.join(',') + '}';
      await prisma.$executeRaw`
        INSERT INTO "WomenProfile" ("id", "userId", "skills", "careerGoals")
        VALUES (${profileId}, ${userId}, ${skillsArray}::text[], ${profileData.careerGoals})
      `;
    } else if (profileType === 'mentorProfile') {
      const expertiseArray = '{' + profileData.expertiseAreas.join(',') + '}';
      await prisma.$executeRaw`
        INSERT INTO "MentorProfile" ("id", "userId", "jobTitle", "company", "yearsExperience", "professionalBackground", "mentorshipType", "expertiseAreas")
        VALUES (${profileId}, ${userId}, ${profileData.jobTitle}, ${profileData.company}, ${profileData.yearsExperience}, ${profileData.professionalBackground}, ${profileData.mentorshipType}::"MentorshipType", ${expertiseArray}::text[])
      `;
    } else if (profileType === 'sponsorProfile') {
      await prisma.$executeRaw`
        INSERT INTO "SponsorProfile" ("id", "userId", "organizationName", "description", "industry")
        VALUES (${profileId}, ${userId}, ${profileData.organizationName}, ${profileData.description}, ${profileData.industry})
      `;
    }
    console.log(`Created User ${email} with ID ${userId}`);
  }
}

async function main() {
  console.log('Starting execution of role seeders...');

  const plainPassword = 'password123';
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

  console.log('1. Upserting Admin Role...');
  await upsertUser(
    'admin@empowher.com',
    { firstName: 'System', lastName: 'Admin', passwordHash, role: 'ADMIN', accountStatus: 'APPROVED' },
    'adminProfile',
    { department: 'Platform Operation' }
  );

  console.log('2. Upserting Woman (Mentee) Role...');
  await upsertUser(
    'woman@empowher.com',
    { firstName: 'Ada', lastName: 'Lovelace', passwordHash, role: 'WOMAN', accountStatus: 'APPROVED' },
    'womenProfile',
    { skills: ['JavaScript', 'React', 'TypeScript'], careerGoals: 'To become a highly skilled Full-Stack Developer passing all technical exams.' }
  );

  console.log('3. Upserting Mentor Role...');
  await upsertUser(
    'mentor@empowher.com',
    { firstName: 'Grace', lastName: 'Hopper', passwordHash, role: 'MENTOR', accountStatus: 'APPROVED' },
    'mentorProfile',
    { jobTitle: 'Senior Tech Lead', company: 'Tech Corp Innovation', yearsExperience: 10, professionalBackground: 'Mentoring junior developers and managing massive scale system architectures for 5 years.', mentorshipType: 'ONLINE', expertiseAreas: ['System Architecture', 'Backend', 'Leadership'] }
  );

  console.log('4. Upserting Sponsor Role...');
  await upsertUser(
    'sponsor@empowher.com',
    { firstName: 'Emma', lastName: 'Watson', passwordHash, role: 'SPONSOR', accountStatus: 'APPROVED' },
    'sponsorProfile',
    { organizationName: 'Women In Tech Foundation', description: 'A global foundation aiming to radically bridge the gender gap in technological ecosystems.', industry: 'Non-Profit / Education' }
  );

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
