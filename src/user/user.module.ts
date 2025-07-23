import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';

import { UserEventService } from './event/user-event.service';
import { PasswordService } from './password/password.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserValidationService } from './validation/user-validation.service';

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
