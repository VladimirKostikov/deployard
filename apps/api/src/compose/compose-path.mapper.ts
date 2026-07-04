export function mapHostPathToContainer(
  hostPath: string,
  hostRoot: string | undefined,
  containerRoot: string | undefined,
): string | null {
  if (!hostRoot?.trim() || !containerRoot?.trim()) {
    return null;
  }

  const normalizedHostRoot = hostRoot.replace(/\/+$/, '');
  const normalizedContainerRoot = containerRoot.replace(/\/+$/, '');

  if (!hostPath.startsWith(normalizedHostRoot)) {
    return null;
  }

  const suffix = hostPath.slice(normalizedHostRoot.length);
  return `${normalizedContainerRoot}${suffix}`;
}
