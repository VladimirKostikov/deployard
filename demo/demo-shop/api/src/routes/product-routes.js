import { Router } from 'express';
import { getPool } from '../db.js';

export function createProductRoutes() {
  const router = Router();

  router.get('/products', async (_request, response) => {
    const result = await getPool().query(
      'SELECT id, name, price, stock FROM products ORDER BY id ASC',
    );

    response.json({ items: result.rows });
  });

  router.get('/products/:id', async (request, response) => {
    const result = await getPool().query(
      'SELECT id, name, price, stock FROM products WHERE id = $1',
      [request.params.id],
    );

    if (result.rows.length === 0) {
      response.status(404).json({ message: 'Product not found' });
      return;
    }

    response.json(result.rows[0]);
  });

  return router;
}
