export const NODE_PORT_MIN = 30000;
export const NODE_PORT_MAX = 32767;

export function resolveAvailableNodePort(
  preferred: number,
  usedPorts: ReadonlySet<number>,
): number {
  const normalized = clampNodePort(preferred);

  if (!usedPorts.has(normalized)) {
    return normalized;
  }

  for (let port = normalized + 1; port <= NODE_PORT_MAX; port++) {
    if (!usedPorts.has(port)) {
      return port;
    }
  }

  for (let port = NODE_PORT_MIN; port < normalized; port++) {
    if (!usedPorts.has(port)) {
      return port;
    }
  }

  throw new Error(`No free NodePort in range ${NODE_PORT_MIN}-${NODE_PORT_MAX}`);
}

function clampNodePort(port: number): number {
  if (port < NODE_PORT_MIN || port > NODE_PORT_MAX) {
    throw new Error(`NodePort ${port} is outside range ${NODE_PORT_MIN}-${NODE_PORT_MAX}`);
  }

  return port;
}
