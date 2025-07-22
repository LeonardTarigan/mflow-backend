import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger, // 👈 Import Logger
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  // ✅ Instantiate a logger for this filter's context
  private readonly logger = new Logger(ErrorFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message;

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

      this.logger.error(
        `[${request.method} ${request.url}] - Unhandled Exception - Status: ${status}`,
        exception.stack, // Include the stack trace for debugging
      );
    }

    response.status(status).json({
      error: message,
    });
  }
}
