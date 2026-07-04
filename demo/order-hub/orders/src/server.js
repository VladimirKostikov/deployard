import express from 'express';
import { waitForHttp } from '../shared/wait-for-http.js';

const port = Number(process.env.PORT ?? 3000);
const serviceName = process.env.APP_NAME ?? 'orders-svc';
const catalogUrl = process.env.CATALOG_URL ?? 'http://catalog-svc:3000';
const inventoryUrl = process.env.INVENTORY_URL ?? 'http://inventory-svc:3000';

const orders = [];
let sequence = 1;

const app = express();
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: serviceName });
});

app.get('/orders', (_request, response) => {
  response.json({ items: orders });
});

app.post('/orders', async (request, response) => {
  const productId = String(request.body?.productId ?? '').trim();
  const quantity = Number(request.body?.quantity ?? 0);

  if (!productId || quantity <= 0) {
    response.status(400).json({ error: 'invalid_order' });
    return;
  }

  try {
    const productResponse = await fetch(`${catalogUrl}/catalog/${productId}`);
    if (!productResponse.ok) {
      response.status(404).json({ error: 'product_not_found' });
      return;
    }

    const product = await productResponse.json();
    const reserveResponse = await fetch(`${inventoryUrl}/inventory/${productId}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    if (!reserveResponse.ok) {
      const body = await reserveResponse.json().catch(() => ({}));
      response.status(reserveResponse.status).json(body);
      return;
    }

    const order = {
      id: `ord-${sequence}`,
      productId,
      productName: product.name,
      quantity,
      total: Number((product.price * quantity).toFixed(2)),
      createdAt: new Date().toISOString(),
    };

    sequence += 1;
    orders.unshift(order);
    response.status(201).json(order);
  } catch (error) {
    response.status(502).json({
      error: 'upstream_failed',
      message: error instanceof Error ? error.message : 'unknown',
    });
  }
});

async function bootstrap() {
  await waitForHttp(`${catalogUrl}/health`);
  await waitForHttp(`${inventoryUrl}/health`);

  app.listen(port, () => {
    process.stdout.write(`${serviceName} listening on ${port}\n`);
  });
}

bootstrap().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
