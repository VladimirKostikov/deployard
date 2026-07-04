import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';
import { ApiErrorCode } from '@dpd/shared';
import { KubeExceptionMapper } from './kube-exception.mapper';

describe('KubeExceptionMapper', () => {
  const configService = {
    get: (key: string, defaultValue?: string) => (key === 'APP_ENV' ? 'development' : defaultValue),
  } as ConfigService;
  const mapper = new KubeExceptionMapper(configService);

  it('maps 404 to not found code', () => {
    const error = mapper.toHttpException(
      { statusCode: 404 },
      {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        resourceLabel: 'Deployment',
        resourceName: 'demo-api',
      },
    );

    expect(error).toBeInstanceOf(HttpException);
    expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(error.getResponse()).toEqual({
      code: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
      message: 'Deployment demo-api not found',
    });
  });

  it('maps ApiException code field to status', () => {
    const error = mapper.toHttpException(
      { code: 403 },
      {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        fallbackCode: ApiErrorCode.ROLLBACK_FAILED,
        resourceLabel: 'Deployment',
        resourceName: 'demo-api',
      },
    );

    expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
    expect(error.getResponse()).toEqual({
      code: ApiErrorCode.FORBIDDEN,
      message: 'Insufficient permissions',
    });
  });

  it('uses kubernetes body message when present', () => {
    const error = mapper.toHttpException(
      {
        code: 422,
        body: { message: 'Deployment.apps "demo-api" is invalid' },
      },
      {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        fallbackCode: ApiErrorCode.ROLLBACK_FAILED,
        resourceLabel: 'Deployment',
        resourceName: 'demo-api',
      },
    );

    expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
    expect(error.getResponse()).toEqual({
      code: ApiErrorCode.ROLLBACK_FAILED,
      message: 'Deployment.apps "demo-api" is invalid',
    });
  });

  it('maps unknown errors to fallback code', () => {
    const error = mapper.toHttpException(
      { code: 500 },
      {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        fallbackCode: ApiErrorCode.ROLLBACK_FAILED,
        resourceLabel: 'Deployment',
        resourceName: 'demo-api',
      },
    );

    expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
    expect(error.getResponse()).toEqual({
      code: ApiErrorCode.ROLLBACK_FAILED,
      message: 'Kubernetes API request failed',
    });
  });
});
