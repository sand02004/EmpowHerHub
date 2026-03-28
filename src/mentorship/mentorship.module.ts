import { Module } from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { MentorshipController } from './mentorship.controller';

import { MentorshipRepository } from './mentorship.repository';

@Module({
  controllers: [MentorshipController],
  providers: [MentorshipService, MentorshipRepository],
})
export class MentorshipModule {}
