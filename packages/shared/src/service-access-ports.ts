export const SERVICE_ACCESS_PORT_START = 31080;
export const SERVICE_ACCESS_PORT_COUNT = 40;

export const SERVICE_ACCESS_PORT_POOL = Array.from(
  { length: SERVICE_ACCESS_PORT_COUNT },
  (_, index) => SERVICE_ACCESS_PORT_START + index,
) as readonly number[];

export function buildServiceAccessKey(
  namespace: string,
  serviceName: string,
  servicePort: number,
): string {
  return `${namespace}/${serviceName}:${servicePort}`;
}

function hashServiceAccessKey(key: string): number {
  let hash = 2166136261;

  for (let index = 0; index < key.length; index++) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function resolveStableServiceAccessPort(
  key: string,
  reservedByKey: ReadonlyMap<string, number> = new Map(),
): number {
  const pool = SERVICE_ACCESS_PORT_POOL;
  const start = hashServiceAccessKey(key) % pool.length;

  for (let offset = 0; offset < pool.length; offset++) {
    const port = pool[(start + offset) % pool.length]!;
    const occupant = [...reservedByKey.entries()].find(([, value]) => value === port)?.[0];

    if (!occupant || occupant === key) {
      return port;
    }
  }

  throw new Error('No free service access ports in pool');
}

export function allocateServiceAccessPort(usedPorts: ReadonlySet<number>): number {
  for (const port of SERVICE_ACCESS_PORT_POOL) {
    if (!usedPorts.has(port)) {
      return port;
    }
  }

  throw new Error('No free service access ports in pool');
}
