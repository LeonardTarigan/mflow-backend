import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';

import { UserEventService } from './domain/event/user-event.service';
import { PasswordService } from './domain/password/password.service';
import { UserValidationService } from './domain/validation/user-validation.service';
import { UserRepository } from './infrastructure/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    UserValidationService,
    UserEventService,
    PasswordService,
  ],
  exports: [UserService],
  imports: [MailModule],
})
export class UserModule {}
