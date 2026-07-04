const maxAttempts = 30;
const delayMs = 1000;

export async function waitForRedis(client) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      if (!client.isOpen) {
        await client.connect();
      }

      await client.ping();
      return;
    } catch {
      if (client.isOpen) {
        await client.disconnect().catch(() => undefined);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Redis is not reachable');
}
