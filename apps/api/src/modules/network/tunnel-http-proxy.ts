import type { IncomingMessage, ServerResponse } from 'node:http';
import { request as httpRequest } from 'node:http';
import type { TunnelRecord } from './tunnel-record';

export function proxyTunnelRequest(
  tunnel: TunnelRecord | undefined,
  req: IncomingMessage,
  res: ServerResponse,
): void {
  if (!tunnel || tunnel.status !== 'active') {
    res.statusCode = 502;
    res.end(tunnel?.error ?? 'Tunnel is not ready');
    return;
  }

  const upstream = httpRequest(
    {
      hostname: '127.0.0.1',
      port: tunnel.localPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${tunnel.localPort}` },
    },
    (response) => {
      res.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(res);
    },
  );

  upstream.on('error', (error) => {
    res.statusCode = 502;
    res.end(error.message);
  });

  req.pipe(upstream);
}
