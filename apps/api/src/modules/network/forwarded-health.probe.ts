import { get } from 'node:http';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function probeForwardedHealth(
  localPort: number,
  path = '/health',
  timeoutMs = 90_000,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const healthy = await probeOnce(localPort, path);
    if (healthy) {
      return true;
    }

    await sleep(1_000);
  }

  return false;
}

function probeOnce(localPort: number, path: string): Promise<boolean> {
  return new Promise((resolve) => {
    const request = get(`http://127.0.0.1:${localPort}${path}`, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        resolve(false);
        return;
      }

      if (path === '/' || path === '/health') {
        response.resume();
        resolve(true);
        return;
      }

      let body = '';
      response.on('data', (chunk) => {
        body += chunk.toString();
      });
      response.on('end', () => {
        try {
          const payload = JSON.parse(body) as { status?: string; items?: unknown[] };
          if (path.includes('/api/')) {
            resolve(Array.isArray(payload.items));
            return;
          }

          resolve(payload.status === 'ok');
        } catch {
          resolve(false);
        }
      });
    });

    request.on('error', () => resolve(false));
    request.setTimeout(3_000, () => {
      request.destroy();
      resolve(false);
    });
  });
}
