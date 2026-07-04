import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiErrorCode, ServiceAccessResult, isBrowserAccessibleServicePort } from '@dpd/shared';
import { probeForwardedHealth } from './forwarded-health.probe';
import { ServiceTunnelService } from './service-tunnel.service';

@Injectable()
export class ServiceBrowserAccessService {
  constructor(
    private readonly configService: ConfigService,
    private readonly tunnelService: ServiceTunnelService,
  ) {}

  async ensureAccess(
    namespace: string,
    serviceName: string,
    servicePort: number,
    cluster?: string,
  ): Promise<ServiceAccessResult> {
    if (!isBrowserAccessibleServicePort(servicePort)) {
      throw new BadRequestException({
        code: ApiErrorCode.SERVICE_NOT_FOUND,
        message: `Service port ${servicePort} is not exposed for browser access`,
      });
    }

    const tunnel = await this.tunnelService.ensureTunnel(
      namespace,
      serviceName,
      servicePort,
      cluster,
    );

    const healthReady = await probeForwardedHealth(tunnel.localPort, '/health', 15_000);
    if (!healthReady) {
      const rootReady = await probeForwardedHealth(tunnel.localPort, '/', 5_000);
      if (!rootReady) {
        throw new BadRequestException({
          code: ApiErrorCode.SERVICE_NOT_FOUND,
          message: `Service ${serviceName} is not reachable yet`,
        });
      }
    }

    return this.buildAccessResult(namespace, serviceName, tunnel.localPort, tunnel.id);
  }

  async prepareAccess(
    namespace: string,
    serviceName: string,
    servicePort: number,
    cluster?: string,
  ): Promise<ServiceAccessResult> {
    if (!isBrowserAccessibleServicePort(servicePort)) {
      throw new BadRequestException({
        code: ApiErrorCode.SERVICE_NOT_FOUND,
        message: `Service port ${servicePort} is not exposed for browser access`,
      });
    }

    const tunnel = await this.tunnelService.ensureTunnel(
      namespace,
      serviceName,
      servicePort,
      cluster,
    );

    return this.buildAccessResult(namespace, serviceName, tunnel.localPort, tunnel.id);
  }

  private buildAccessResult(
    namespace: string,
    serviceName: string,
    localPort: number,
    tunnelId: string,
  ): ServiceAccessResult {
    return {
      url: this.buildPublicUrl(localPort),
      localPort,
      tunnelId,
      namespace,
      serviceName,
    };
  }

  private buildPublicUrl(localPort: number): string {
    const host = this.configService
      .get<string>('SERVICE_ACCESS_PUBLIC_HOST', 'http://localhost')
      .replace(/\/$/, '');

    return `${host}:${localPort}`;
  }
}
