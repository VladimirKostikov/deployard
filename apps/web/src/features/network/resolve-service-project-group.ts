import type { ServiceSummary } from '@dpd/shared';

export interface ServiceProjectGroup {
  key: string;
  label: string;
  services: ServiceSummary[];
}

export function resolveServiceProjectKey(
  serviceName: string,
  peerNames: string[],
): string {
  for (let index = serviceName.length - 1; index > 0; index--) {
    if (serviceName[index] !== '-') {
      continue;
    }

    const candidate = serviceName.slice(0, index);
    const hasPeers = peerNames.some(
      (peer) => peer !== serviceName && peer.startsWith(`${candidate}-`),
    );

    if (hasPeers) {
      return candidate;
    }
  }

  return serviceName;
}

export function groupServicesByProject(services: ServiceSummary[]): ServiceProjectGroup[] {
  const peerNames = services.map((service) => service.name);
  const grouped = new Map<string, ServiceSummary[]>();

  for (const service of services) {
    const key = resolveServiceProjectKey(service.name, peerNames);
    const bucket = grouped.get(key) ?? [];
    bucket.push(service);
    grouped.set(key, bucket);
  }

  return [...grouped.entries()]
    .map(([key, bucket]) => ({
      key,
      label: key,
      services: bucket.sort((left, right) => left.name.localeCompare(right.name)),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}
