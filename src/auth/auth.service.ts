import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(data: Prisma.UserCreateInput) {
    // 1. Check if the user already exists
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Hash the password before saving
    // (Note: your schema calls the field 'passwordHash', so we expect the plain text password to be sent there for now)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.passwordHash, saltRounds);

    // 3. Create the user in the database via our UsersService
    const user = await this.usersService.createUser({
      ...data,
      passwordHash: hashedPassword, // Override plain password with the hashed one
    });

    // 4. Generate a JWT token for them immediately after signing up
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName }
    };
  }

  async login(email: string, pass: string) {
    // 1. Find the user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check the password
    const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Generate a JWT token
    // 'sub' is the standard JWT naming convention for the Subject (User ID)
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName }
    };
  }
}
