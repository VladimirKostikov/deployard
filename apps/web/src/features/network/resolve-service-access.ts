import type { ServicePortSummary, ServiceSummary } from '@dpd/shared';
import { isBrowserAccessibleServicePort } from '@dpd/shared';

export interface ServiceAccessInfo {
  command: string;
  servicePort: number;
}

function pickAccessPort(ports: ServicePortSummary[]): ServicePortSummary | undefined {
  return ports.find((port) => isBrowserAccessibleServicePort(port.port));
}

function buildPortForwardCommand(
  service: ServiceSummary,
  port: ServicePortSummary,
): string {
  return `kubectl port-forward svc/${service.name} ${port.port}:${port.port} -n ${service.namespace}`;
}

export function resolveServiceAccess(service: ServiceSummary): ServiceAccessInfo | null {
  if (service.type === 'ExternalName') {
    return null;
  }

  const port = pickAccessPort(service.ports);
  if (!port) {
    return null;
  }

  return {
    command: buildPortForwardCommand(service, port),
    servicePort: port.port,
  };
}
