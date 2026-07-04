export function resolveTunnelProxyPath(originalUrl: string, tunnelId: string): string {
  const prefix = `/api/network/tunnels/${tunnelId}/proxy`;
  const path = originalUrl.split('?')[0] ?? originalUrl;

  if (!path.startsWith(prefix)) {
    return '/';
  }

  const suffix = path.slice(prefix.length);
  const queryIndex = originalUrl.indexOf('?');
  const query = queryIndex >= 0 ? originalUrl.slice(queryIndex) : '';

  return `${suffix || '/'}${query}`;
}
