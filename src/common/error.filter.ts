import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ZodError } from 'zod';

@Injectable()
@Catch()
export class ErrorFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        message = (exceptionResponse as { message: string }).message;
      } else {
        message = exceptionResponse as string;
      }

      this.logger.error(
        `[${request.method} ${request.url}] - Status: ${status} - Message: ${message}`,
      );
    } else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      this.logger.error(
        `[${request.method} ${request.url}] - Validation Error - Status: ${status} - Message: ${message}`,
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An internal server error occurred';
      if (exception instanceof Error) {
        this.logger.error(
          `[${request.method} ${request.url}] - Unhandled Exception`,
          exception.stack,
        );
      } else {
        this.logger.error(
          `[${request.method} ${request.url}] - Unhandled Exception`,
          exception,
        );
      }
    }

    response.status(status).json({
      error: message,
    });
  }
}
