import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserListener {
  constructor(private readonly mailService: MailService) {}

  @OnEvent('user.created')
  handleUserCreatedEvent(payload: { user: User; generatedPassword: string }) {
    this.mailService.sendWelcomeEmail(payload.user, payload.generatedPassword);
  }
}
