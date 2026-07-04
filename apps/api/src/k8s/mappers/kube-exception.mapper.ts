import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiErrorCode } from '@dpd/shared';

interface K8sErrorBody {
  message?: string;
  reason?: string;
}

interface K8sErrorShape {
  statusCode?: number;
  code?: number;
  body?: string | K8sErrorBody;
  message?: string;
}

@Injectable()
export class KubeExceptionMapper {
  constructor(private readonly configService: ConfigService) {}
  toHttpException(
    error: unknown,
    options: {
      notFoundCode: ApiErrorCode;
      fallbackCode?: ApiErrorCode;
      resourceLabel: string;
      resourceName: string;
    },
  ): HttpException {
    const statusCode = this.resolveStatusCode(error);
    const fallbackCode = options.fallbackCode ?? ApiErrorCode.K8S_API_ERROR;
    const k8sMessage = this.resolveClientMessage(this.resolveK8sMessage(error));

    if (statusCode === 404) {
      return new HttpException(
        {
          code: options.notFoundCode,
          message: `${options.resourceLabel} ${options.resourceName} not found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (statusCode === 403) {
      return new HttpException(
        { code: ApiErrorCode.FORBIDDEN, message: 'Insufficient permissions' },
        HttpStatus.FORBIDDEN,
      );
    }

    if (statusCode === 422 || statusCode === 409) {
      return new HttpException(
        {
          code: fallbackCode,
          message: k8sMessage ?? 'Kubernetes rejected the request',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    return new HttpException(
      {
        code: fallbackCode,
        message: k8sMessage ?? 'Kubernetes API request failed',
      },
      HttpStatus.BAD_GATEWAY,
    );
  }

  resolveStatusCode(error: unknown): number | undefined {
    const shape = error as K8sErrorShape;
    if (typeof shape?.code === 'number') {
      return shape.code;
    }
    if (typeof shape?.statusCode === 'number') {
      return shape.statusCode;
    }
    return undefined;
  }

  private resolveK8sMessage(error: unknown): string | undefined {
    const shape = error as K8sErrorShape;

    if (typeof shape?.body === 'object' && shape.body?.message) {
      return shape.body.message;
    }

    if (typeof shape?.body === 'string') {
      try {
        const parsed = JSON.parse(shape.body) as K8sErrorBody;
        if (parsed.message) {
          return parsed.message;
        }
      } catch {
        return undefined;
      }
    }

    if (typeof shape?.message === 'string' && shape.message.length > 0) {
      return shape.message;
    }

    return undefined;
  }

  private resolveClientMessage(message: string | undefined) {
    if (!message) {
      return undefined;
    }

    if (this.configService.get<string>('APP_ENV', 'development') === 'production') {
      return undefined;
    }

    return message;
  }
}
