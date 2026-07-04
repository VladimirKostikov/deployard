import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorBody, ApiErrorCode } from '@dpd/shared';
import { mapHttpStatusToApiErrorCode } from '../mappers/http-status-code.mapper';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'code' in exceptionResponse) {
        response.status(status).json(exceptionResponse);
        return;
      }

      const body: ApiErrorBody = {
        code: mapHttpStatusToApiErrorCode(status),
        message: exception.message,
      };
      response.status(status).json(body);
      return;
    }

    this.logger.error(exception);
    const body: ApiErrorBody = {
      code: ApiErrorCode.INTERNAL_ERROR,
      message: 'Internal server error',
    };
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}
