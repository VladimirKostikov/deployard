import express from 'express';
import { products } from '../shared/products.js';

const port = Number(process.env.PORT ?? 3000);
const serviceName = process.env.APP_NAME ?? 'catalog-svc';

const app = express();

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: serviceName });
});

app.get('/catalog', (_request, response) => {
  response.json({ items: products });
});

app.get('/catalog/:id', (request, response) => {
  const product = products.find((entry) => entry.id === request.params.id);
  if (!product) {
    response.status(404).json({ error: 'product_not_found' });
    return;
  }

  response.json(product);
});

app.listen(port, () => {
  process.stdout.write(`${serviceName} listening on ${port}\n`);
});
