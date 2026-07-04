import { timingSafeEqual } from 'node:crypto';
import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiErrorCode, DeployWebhookResult } from '@dpd/shared';
import { DeploymentsService } from '../deployments/deployments.service';
import { DeployWebhookDto } from './dto/deploy-webhook.dto';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly configService: ConfigService,
    private readonly deploymentsService: DeploymentsService,
  ) {}

  assertEnabled() {
    const secret = this.configService.get<string>('DEPLOY_WEBHOOK_SECRET');
    if (!secret?.trim()) {
      throw new ServiceUnavailableException({
        code: ApiErrorCode.WEBHOOK_DISABLED,
        message: 'Deploy webhook is disabled. Set DEPLOY_WEBHOOK_SECRET on the API server.',
      });
    }

    return secret;
  }

  assertSecret(providedSecret: string | undefined) {
    const secret = this.assertEnabled();

    if (!providedSecret || !this.secretsMatch(providedSecret, secret)) {
      throw new UnauthorizedException({
        code: ApiErrorCode.WEBHOOK_UNAUTHORIZED,
        message: 'Invalid deploy webhook secret',
      });
    }
  }

  assertNamespaceAllowed(namespace: string) {
    const raw = this.configService.get<string>('WEBHOOK_ALLOWED_NAMESPACES')?.trim();
    if (!raw) {
      return;
    }

    const allowed = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!allowed.includes(namespace)) {
      throw new ForbiddenException({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Webhook namespace is not allowed',
      });
    }
  }

  private secretsMatch(provided: string, expected: string) {
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
  }

  async applyDeploy(dto: DeployWebhookDto): Promise<DeployWebhookResult> {
    this.assertNamespaceAllowed(dto.namespace);

    const action = dto.action ?? 'update_image';

    if (action === 'create') {
      await this.deploymentsService.create({
        namespace: dto.namespace,
        name: dto.deployment,
        image: dto.image,
        replicas: dto.replicas ?? 1,
        containerPort: dto.containerPort ?? 80,
      });
    } else {
      await this.deploymentsService.updateImage(dto.namespace, dto.deployment, { image: dto.image });
    }

    return {
      ok: true,
      action,
      namespace: dto.namespace,
      deployment: dto.deployment,
      image: dto.image,
    };
  }
}
