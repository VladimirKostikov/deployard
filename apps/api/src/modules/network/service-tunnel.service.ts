import type { IncomingMessage, ServerResponse } from 'node:http';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import type { ServiceTunnelSummary } from '@dpd/shared';
import { K8sService } from '../../k8s/k8s.service';
import { startKubectlForward } from './tunnel-kubectl-forward';
import { proxyTunnelRequest } from './tunnel-http-proxy';
import { TunnelPortRegistry } from './tunnel-port-registry';
import { toTunnelSummary, waitForTunnelReady, type TunnelRecord } from './tunnel-record';

@Injectable()
export class ServiceTunnelService implements OnModuleDestroy {
  private readonly tunnels = new Map<string, TunnelRecord>();
  private readonly portRegistry = new TunnelPortRegistry();

  constructor(private readonly k8sService: K8sService) {}

  onModuleDestroy() {
    for (const id of [...this.tunnels.keys()]) {
      this.stop(id);
    }
  }

  list(): ServiceTunnelSummary[] {
    return [...this.tunnels.values()].map((tunnel) => toTunnelSummary(tunnel));
  }

  async start(
    namespace: string,
    serviceName: string,
    servicePort: number,
    cluster?: string,
  ): Promise<ServiceTunnelSummary> {
    const localPort = this.portRegistry.resolvePublishedPort(
      namespace,
      serviceName,
      servicePort,
      this.tunnels.values(),
      (id) => this.stop(id),
    );

    return this.startForward(namespace, serviceName, servicePort, localPort, cluster);
  }

  async ensureTunnel(
    namespace: string,
    serviceName: string,
    servicePort: number,
    cluster?: string,
  ): Promise<ServiceTunnelSummary> {
    const existing = this.findTunnel(namespace, serviceName, servicePort, cluster);

    if (existing) {
      await waitForTunnelReady(existing, 8_000);
      if (existing.status === 'active') {
        return toTunnelSummary(existing);
      }

      this.stop(existing.id);
    }

    const localPort = this.portRegistry.resolvePublishedPort(
      namespace,
      serviceName,
      servicePort,
      this.tunnels.values(),
      (id) => this.stop(id),
    );

    const summary = await this.startForward(
      namespace,
      serviceName,
      servicePort,
      localPort,
      cluster,
      true,
    );

    if (summary.status === 'error') {
      throw new Error(summary.error ?? 'Port-forward failed');
    }

    return summary;
  }

  stop(id: string): void {
    const tunnel = this.tunnels.get(id);
    if (!tunnel) {
      return;
    }

    tunnel.process.kill('SIGTERM');
    this.tunnels.delete(id);
    this.portRegistry.releasePortBinding(tunnel);
  }

  proxy(id: string, req: IncomingMessage, res: ServerResponse): void {
    proxyTunnelRequest(this.tunnels.get(id), req, res);
  }

  private findTunnel(
    namespace: string,
    serviceName: string,
    servicePort: number,
    cluster?: string,
  ): TunnelRecord | undefined {
    return [...this.tunnels.values()].find(
      (tunnel) =>
        tunnel.namespace === namespace &&
        tunnel.serviceName === serviceName &&
        tunnel.servicePort === servicePort &&
        tunnel.cluster === cluster,
    );
  }

  private async startForward(
    namespace: string,
    serviceName: string,
    servicePort: number,
    localPort: number,
    cluster?: string,
    skipExisting = false,
  ): Promise<ServiceTunnelSummary> {
    if (!skipExisting) {
      const existing = this.findTunnel(namespace, serviceName, servicePort, cluster);
      if (existing) {
        await waitForTunnelReady(existing, 8_000);
        return toTunnelSummary(existing);
      }
    }

    return startKubectlForward(
      this.k8sService,
      this.portRegistry,
      this.tunnels,
      namespace,
      serviceName,
      servicePort,
      localPort,
      cluster,
    );
  }
}
