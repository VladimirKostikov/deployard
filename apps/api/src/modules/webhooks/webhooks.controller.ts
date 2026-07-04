import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { DeployWebhookResult } from '@dpd/shared';
import { Public } from '../auth/decorators/auth.decorators';
import { DeployWebhookDto } from './dto/deploy-webhook.dto';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('deploy')
  @ApiHeader({ name: 'X-Deploy-Secret', required: true })
  @ApiHeader({ name: 'X-K8s-Cluster', required: false })
  deploy(
    @Body() dto: DeployWebhookDto,
    @Headers('x-deploy-secret') secret: string | undefined,
  ): Promise<DeployWebhookResult> {
    this.webhooksService.assertSecret(secret);
    return this.webhooksService.applyDeploy(dto);
  }
}
