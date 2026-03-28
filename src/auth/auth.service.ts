import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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
    const role = user.role.toLowerCase();
    let passedAssessment = true;

    if (user.role === 'WOMAN') {
      const rows: any[] = await this.prisma.client.$queryRaw`
        SELECT id FROM "UserTest" WHERE "userId" = ${user.id} AND passed = true LIMIT 1
      `;
      passedAssessment = rows.length > 0;
    }

    const payload = { sub: user.id, email: user.email, role, status: user.accountStatus || 'PENDING', assessmentPassed: passedAssessment, dashboardPath: `/dashboard/${role}` };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, role, firstName: user.firstName, status: user.accountStatus || 'PENDING', assessmentPassed: passedAssessment, dashboardPath: `/dashboard/${role}` }
    };
  }

  async registerWoman(data: RegisterWomanDto) {
    await this.ensureUniqueEmail(data.email);
    const passwordHash = await this.hashPassword(data.passwordHash);
    const user = await this.usersService.createUser({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'WOMAN',
    });
    return this.generateAuthResponse(user);
  }

  async registerMentor(data: RegisterMentorDto) {
    await this.ensureUniqueEmail(data.email);
    const passwordHash = await this.hashPassword(data.passwordHash);
    const user = await this.usersService.createUser({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'MENTOR',
    });
    // Set mentor-specific data
    await this.prisma.client.$executeRaw`
      UPDATE "MentorProfile" SET
        "professionalBackground" = ${data.professionalBackground ?? null},
        "yearsExperience" = ${data.yearsExperience ?? 0}
      WHERE "userId" = ${user.id}
    `;
    return this.generateAuthResponse(user);
  }

  async registerSponsor(data: RegisterSponsorDto) {
    await this.ensureUniqueEmail(data.email);
    const passwordHash = await this.hashPassword(data.passwordHash);
    const user = await this.usersService.createUser({
      email: data.email,
      passwordHash,
      firstName: 'Sponsor',
      lastName: 'Rep',
      role: 'SPONSOR',
      organizationName: data.organizationName,
    });
    await this.prisma.client.$executeRaw`
      UPDATE "SponsorProfile" SET
        "organizationName" = ${data.organizationName ?? 'N/A'},
        description = ${data.description ?? null}
      WHERE "userId" = ${user.id}
    `;
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
