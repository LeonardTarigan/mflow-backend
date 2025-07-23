import { Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UserEntity } from 'src/user/domain/model/user.schema';
import { Logger } from 'winston';

@Injectable()
export class MailService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly mailerService: MailerService,
  ) {}

  async sendWelcomeEmail(
    user: UserEntity,
    plainTextPass: string,
  ): Promise<void> {
    this.logger.info(`Sending welcome email to ${user.email}`);

    try {
      await Promise.race([
        this.mailerService.sendMail({
          to: user.email,
          subject: 'Informasi Akun MFlow Anda',
          template: 'user-welcome',
          context: {
            username: user.username,
            password: plainTextPass,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email timeout')), 5000),
        ),
      ]);

      this.logger.info(`Welcome email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}`,
        error.stack,
      );
    }
  }
}
