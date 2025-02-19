import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        error: exception.getResponse(),
      });
    } else if (exception instanceof ZodError) {
      const error = exception.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      response.status(HttpStatus.BAD_REQUEST).json({
        error,
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: exception.message,
      });
    }
  }
}
