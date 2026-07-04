export const LOCAL_KIND_HOST_NODE_PORTS = [30080, 30081] as const;

const CONTAINER_PORT_TO_NODE_PORT: Record<number, number> = {
  80: 30081,
  8080: 30081,
  3000: 30080,
};

export function resolveLocalKindNodePort(
  containerPort: number,
  hostPort?: number,
): number | undefined {
  if (hostPort && hostPort >= 30000 && hostPort <= 32767) {
    return hostPort;
  }

  return CONTAINER_PORT_TO_NODE_PORT[containerPort];
}

export function isHostMappedNodePort(nodePort: number): boolean {
  return (LOCAL_KIND_HOST_NODE_PORTS as readonly number[]).includes(nodePort);
}
