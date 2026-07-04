import type { ServiceTunnelSummary } from '@dpd/shared';
import type { ChildProcess } from 'node:child_process';

export interface TunnelRecord {
  id: string;
  namespace: string;
  serviceName: string;
  servicePort: number;
  localPort: number;
  cluster?: string;
  status: 'starting' | 'active' | 'error';
  error?: string;
  process: ChildProcess;
}

export function toTunnelSummary(tunnel: TunnelRecord): ServiceTunnelSummary {
  return {
    id: tunnel.id,
    namespace: tunnel.namespace,
    serviceName: tunnel.serviceName,
    servicePort: tunnel.servicePort,
    localPort: tunnel.localPort,
    status: tunnel.status,
    proxyUrl: `/api/network/tunnels/${tunnel.id}/proxy/`,
    error: tunnel.error,
  };
}

export function waitForTunnelReady(tunnel: TunnelRecord, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    if (tunnel.status === 'active' || tunnel.status === 'error') {
      resolve();
      return;
    }

    const started = Date.now();
    const timer = setInterval(() => {
      if (tunnel.status === 'active' || tunnel.status === 'error') {
        clearInterval(timer);
        resolve();
        return;
      }

      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        resolve();
      }
    }, 100);
  });
}
