import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { RegisterWomanDto, RegisterMentorDto, RegisterSponsorDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async ensureUniqueEmail(email: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('User with this email already exists');
  }

  private async generateAuthResponse(user: any) {
    let passedAssessment = true;
    if (user.role === Role.WOMAN) {
      const passedTest = await this.prisma.client.userTest.findFirst({
        where: { userId: user.id, passed: true }
      });
      passedAssessment = !!passedTest;
    }

    const payload = { sub: user.id, email: user.email, role: user.role, status: user.accountStatus, assessmentPassed: passedAssessment };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, status: user.accountStatus, assessmentPassed: passedAssessment }
    };
  }

  async registerWoman(data: RegisterWomanDto) {
    await this.ensureUniqueEmail(data.email);
    const passwordHash = await this.hashPassword(data.passwordHash);

    const user = await this.prisma.client.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: Role.WOMAN,
        womenProfile: {
          create: {
            skills: data.skills,
          }
        }
      }
    });

    return this.generateAuthResponse(user);
  }

  async registerMentor(data: RegisterMentorDto) {
    await this.ensureUniqueEmail(data.email);
    const passwordHash = await this.hashPassword(data.passwordHash);

    const user = await this.prisma.client.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: Role.MENTOR,
        mentorProfile: {
          create: {
            professionalBackground: data.professionalBackground,
            yearsExperience: data.yearsExperience,
          }
        }
      }
    });

    return this.generateAuthResponse(user);
  }

  async registerSponsor(data: RegisterSponsorDto) {
    await this.ensureUniqueEmail(data.email);
    const passwordHash = await this.hashPassword(data.passwordHash);

    const user = await this.prisma.client.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: 'Sponsor',
        lastName: 'Rep',
        role: Role.SPONSOR,
        sponsorProfile: {
          create: {
            organizationName: data.organizationName,
            description: data.description,
            website: data.website,
          }
        }
      }
    });

    return this.generateAuthResponse(user);
  }

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return this.generateAuthResponse(user);
  }
}
