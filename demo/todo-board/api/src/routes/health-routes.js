import { Router } from 'express';

export function createHealthRoutes(client) {
  const router = Router();

  router.get('/health', (_request, response) => {
    response.json({ status: 'ok', service: process.env.APP_NAME ?? 'todo-board' });
  });

  router.get('/ready', async (_request, response) => {
    try {
      await client.ping();
      response.json({ status: 'ready' });
    } catch {
      response.status(503).json({ status: 'not-ready' });
    }
  });

  return router;
}
