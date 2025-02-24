import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { join } from 'path';
import * as winston from 'winston';
import { ErrorFilter } from './error.filter';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'MM/DD/YYYY, hh:mm:ss A' }),
        winston.format.printf(({ level, message, timestamp }) => {
          if (typeof message === 'object') {
            const { ...rest } = message;
            message =
              Object.keys(rest).length > 2
                ? `\n${JSON.stringify(rest, null, 2)}`
                : JSON.stringify(rest);
          }
          const color = {
            info: '\x1b[32m',
            error: '\x1b[31m',
            warn: '\x1b[33m',
            debug: '\x1b[34m',
            reset: '\x1b[0m',
            cyan: '\x1b[36m',
          };

          const levelColor = color[level] || '\x1b[37m';

          return `${color.cyan}${timestamp}${color.reset} ${levelColor}[${level.toUpperCase()}]${color.reset}: ${message}`;
        }),
      ),
      transports: [new winston.transports.Console()],
      silent: process.env.NODE_ENV === 'test',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: configService.get<boolean>('MAIL_SECURE'),
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `${configService.get<string>('APP_NAME')} <${configService.get<string>('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, '..', 'mail', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
  ],
  exports: [PrismaService, ValidationService],
})
export class CommonModule {}
