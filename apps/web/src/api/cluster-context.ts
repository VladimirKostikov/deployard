let currentCluster: string | undefined;

export function setClusterContext(cluster: string | undefined) {
  currentCluster = cluster;
}

export function getClusterContext() {
  return currentCluster;
}

export function withClusterQuery(path: string) {
  if (!currentCluster) {
    return path;
  }

  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}cluster=${encodeURIComponent(currentCluster)}`;
}
