import { describe, expect, it } from 'vitest';
import { resolveTunnelProxyPath } from './tunnel-proxy-path';

describe('resolveTunnelProxyPath', () => {
  const tunnelId = 'abc-123';

  it('maps tunnel root to upstream root', () => {
    expect(resolveTunnelProxyPath(`/api/network/tunnels/${tunnelId}/proxy`, tunnelId)).toBe('/');
    expect(resolveTunnelProxyPath(`/api/network/tunnels/${tunnelId}/proxy/`, tunnelId)).toBe('/');
  });

  it('forwards nested API paths', () => {
    expect(resolveTunnelProxyPath(`/api/network/tunnels/${tunnelId}/proxy/api/products`, tunnelId)).toBe(
      '/api/products',
    );
  });

  it('keeps query string', () => {
    expect(
      resolveTunnelProxyPath(
        `/api/network/tunnels/${tunnelId}/proxy/api/products?limit=5`,
        tunnelId,
      ),
    ).toBe('/api/products?limit=5');
  });
});
