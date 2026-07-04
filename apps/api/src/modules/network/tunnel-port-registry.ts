import { buildServiceAccessKey, resolveStableServiceAccessPort } from '@dpd/shared';
import type { TunnelRecord } from './tunnel-record';

export class TunnelPortRegistry {
  private readonly assignedPorts = new Map<string, number>();

  resolvePublishedPort(
    namespace: string,
    serviceName: string,
    servicePort: number,
    tunnels: Iterable<TunnelRecord>,
    stopTunnel: (id: string) => void,
  ): number {
    const key = buildServiceAccessKey(namespace, serviceName, servicePort);
    const assigned = this.assignedPorts.get(key);
    if (assigned) {
      return assigned;
    }

    const port = resolveStableServiceAccessPort(key, this.assignedPorts);
    this.releasePortConflicts(key, port, tunnels, stopTunnel);
    this.assignedPorts.set(key, port);
    return port;
  }

  releasePortBinding(tunnel: TunnelRecord): void {
    const key = buildServiceAccessKey(tunnel.namespace, tunnel.serviceName, tunnel.servicePort);
    if (this.assignedPorts.get(key) === tunnel.localPort) {
      this.assignedPorts.delete(key);
    }
  }

  private releasePortConflicts(
    key: string,
    port: number,
    tunnels: Iterable<TunnelRecord>,
    stopTunnel: (id: string) => void,
  ): void {
    for (const [otherKey, otherPort] of [...this.assignedPorts.entries()]) {
      if (otherPort !== port || otherKey === key) {
        continue;
      }

      this.assignedPorts.delete(otherKey);
      const tunnel = this.findTunnelByKey(otherKey, tunnels);
      if (tunnel) {
        stopTunnel(tunnel.id);
      }
    }

    for (const tunnel of tunnels) {
      if (tunnel.localPort !== port) {
        continue;
      }

      const tunnelKey = buildServiceAccessKey(
        tunnel.namespace,
        tunnel.serviceName,
        tunnel.servicePort,
      );

      if (tunnelKey !== key) {
        stopTunnel(tunnel.id);
      }
    }
  }

  private findTunnelByKey(key: string, tunnels: Iterable<TunnelRecord>): TunnelRecord | undefined {
    return [...tunnels].find(
      (tunnel) =>
        buildServiceAccessKey(tunnel.namespace, tunnel.serviceName, tunnel.servicePort) === key,
    );
  }
}
