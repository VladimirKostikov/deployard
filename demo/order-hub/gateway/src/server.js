import { createClient } from 'redis';
import express from 'express';
import { waitForHttp } from '../shared/wait-for-http.js';

const port = Number(process.env.PORT ?? 3000);
const serviceName = process.env.APP_NAME ?? 'hub-gateway';
const catalogUrl = process.env.CATALOG_URL ?? 'http://catalog-svc:3000';
const inventoryUrl = process.env.INVENTORY_URL ?? 'http://inventory-svc:3000';
const ordersUrl = process.env.ORDERS_URL ?? 'http://orders-svc:3000';

async function probeService(name, baseUrl) {
  const started = Date.now();

  try {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    return {
      name,
      url: baseUrl,
      status: response.ok ? 'up' : 'down',
      latencyMs: Date.now() - started,
      detail: body.service ?? name,
    };
  } catch (error) {
    return {
      name,
      url: baseUrl,
      status: 'down',
      latencyMs: Date.now() - started,
      detail: error instanceof Error ? error.message : 'unreachable',
    };
  }
}

async function bootstrap() {
  const redis = createClient({
    socket: {
      host: process.env.REDIS_HOST ?? 'order-redis',
      port: Number(process.env.REDIS_PORT ?? 6379),
    },
  });

  redis.on('error', (error) => {
    process.stderr.write(`${error.message}\n`);
  });

  await redis.connect();
  await waitForHttp(`${catalogUrl}/health`);
  await waitForHttp(`${inventoryUrl}/health`);
  await waitForHttp(`${ordersUrl}/health`);

  const app = express();
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok', service: serviceName });
  });

  app.get('/api/mesh', async (_request, response) => {
    const nodes = await Promise.all([
      probeService('Catalog', catalogUrl),
      probeService('Inventory', inventoryUrl),
      probeService('Orders', ordersUrl),
      probeService('Redis', `redis://${process.env.REDIS_HOST ?? 'order-redis'}:${process.env.REDIS_PORT ?? 6379}`),
    ]);

    const redisNode = nodes[3];
    if (redisNode.url.startsWith('redis://')) {
      try {
        const pingStarted = Date.now();
        await redis.ping();
        redisNode.status = 'up';
        redisNode.latencyMs = Date.now() - pingStarted;
        redisNode.detail = 'PONG';
      } catch (error) {
        redisNode.status = 'down';
        redisNode.detail = error instanceof Error ? error.message : 'unreachable';
      }
    }

    response.json({
      gateway: serviceName,
      nodes: nodes.slice(0, 3).concat(redisNode),
    });
  });

  app.get('/api/catalog', async (_request, response) => {
    const cacheKey = 'catalog:v1';
    const cached = await redis.get(cacheKey);

    if (cached) {
      response.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    const upstream = await fetch(`${catalogUrl}/catalog`);
    const payload = await upstream.json();
    await redis.set(cacheKey, JSON.stringify(payload), { EX: 30 });
    response.json({ ...payload, cached: false });
  });

  app.get('/api/inventory', async (_request, response) => {
    const upstream = await fetch(`${inventoryUrl}/inventory`);
    const payload = await upstream.json();
    response.status(upstream.status).json(payload);
  });

  app.get('/api/orders', async (_request, response) => {
    const upstream = await fetch(`${ordersUrl}/orders`);
    const payload = await upstream.json();
    response.status(upstream.status).json(payload);
  });

  app.post('/api/orders', async (request, response) => {
    const upstream = await fetch(`${ordersUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.body ?? {}),
    });

    const payload = await upstream.json().catch(() => ({}));
    response.status(upstream.status).json(payload);
  });

  app.listen(port, () => {
    process.stdout.write(`${serviceName} listening on ${port}\n`);
  });
}

bootstrap().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
