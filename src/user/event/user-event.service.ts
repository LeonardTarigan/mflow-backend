import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';

import { UserEvent } from './user.event';

@Injectable()
export class UserEventService {
  constructor(private readonly mailService: MailService) {}

  @OnEvent(UserEvent.Created)
  handleUserCreatedEvent(payload: {
    user: User;
    generatedPassword: string;
  }): void {
    this.mailService.sendWelcomeEmail(payload.user, payload.generatedPassword);
  }
}
