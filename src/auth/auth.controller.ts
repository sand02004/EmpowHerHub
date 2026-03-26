import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterWomanDto, RegisterMentorDto, RegisterSponsorDto, LoginDto } from './auth.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a Woman user' })
  @ApiBody({ type: RegisterWomanDto })
  @Post('register/woman')
  registerWoman(@Body() body: RegisterWomanDto) {
    return this.authService.registerWoman(body);
  }

  @ApiOperation({ summary: 'Register a Mentor' })
  @ApiBody({ type: RegisterMentorDto })
  @Post('register/mentor')
  registerMentor(@Body() body: RegisterMentorDto) {
    return this.authService.registerMentor(body);
  }

  @ApiOperation({ summary: 'Register a Sponsor organization' })
  @ApiBody({ type: RegisterSponsorDto })
  @Post('register/sponsor')
  registerSponsor(@Body() body: RegisterSponsorDto) {
    return this.authService.registerSponsor(body);
  }

  @ApiOperation({ summary: 'Login and get an access token' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }
}
