import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { MentorshipModule } from './mentorship/mentorship.module';
import { UploadsModule } from './uploads/uploads.module';
import { MessagesModule } from './messages/messages.module';
import { TestsModule } from './tests/tests.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, OpportunitiesModule, MentorshipModule, UploadsModule, MessagesModule, TestsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
