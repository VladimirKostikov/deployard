import express from 'express';

const port = Number(process.env.PORT ?? 3000);
const serviceName = process.env.APP_NAME ?? 'inventory-svc';

const stock = new Map([
  ['sku-mug', 18],
  ['sku-sticker', 120],
  ['sku-hoodie', 6],
]);

const app = express();
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: serviceName });
});

app.get('/inventory', (_request, response) => {
  const items = [...stock.entries()].map(([sku, quantity]) => ({ sku, quantity }));
  response.json({ items });
});

app.get('/inventory/:sku', (request, response) => {
  const quantity = stock.get(request.params.sku);
  if (quantity === undefined) {
    response.status(404).json({ error: 'sku_not_found' });
    return;
  }

  response.json({ sku: request.params.sku, quantity });
});

app.post('/inventory/:sku/reserve', (request, response) => {
  const sku = request.params.sku;
  const requested = Number(request.body?.quantity ?? 0);
  const available = stock.get(sku);

  if (available === undefined || requested <= 0) {
    response.status(400).json({ error: 'invalid_reservation' });
    return;
  }

  if (available < requested) {
    response.status(409).json({ error: 'insufficient_stock', available });
    return;
  }

  stock.set(sku, available - requested);
  response.json({ sku, reserved: requested, remaining: stock.get(sku) });
});

app.listen(port, () => {
  process.stdout.write(`${serviceName} listening on ${port}\n`);
});
