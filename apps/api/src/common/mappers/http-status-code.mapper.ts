import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@dpd/shared';

export function mapHttpStatusToApiErrorCode(status: number): ApiErrorCode {
  if (status === HttpStatus.NOT_FOUND) return ApiErrorCode.DEPLOYMENT_NOT_FOUND;
  if (status === HttpStatus.FORBIDDEN) return ApiErrorCode.FORBIDDEN;
  if (status === HttpStatus.BAD_REQUEST) return ApiErrorCode.VALIDATION_ERROR;
  return ApiErrorCode.INTERNAL_ERROR;
}
