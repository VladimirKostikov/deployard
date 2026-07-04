import express from 'express';
import { getPool } from './db.js';
import { createHealthRoutes } from './routes/health-routes.js';
import { createProductRoutes } from './routes/product-routes.js';
import { ensureSchema, seedProductsIfEmpty } from './seed-products.js';
import { waitForDatabase } from './wait-for-db.js';

const port = Number(process.env.PORT ?? 3000);

async function bootstrap() {
  await waitForDatabase();

  const pool = getPool();
  await ensureSchema(pool);
  await seedProductsIfEmpty(pool);

  const app = express();

  app.use(createHealthRoutes());
  app.use('/api', createProductRoutes());

  app.listen(port, () => {
    process.stdout.write(`demo-shop-api listening on ${port}\n`);
  });
}

bootstrap().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
