import { Router } from 'express';
import { pingDatabase } from '../db.js';

export function createHealthRoutes() {
  const router = Router();

  router.get('/health', (_request, response) => {
    response.json({
      status: 'ok',
      version: process.env.APP_VERSION ?? '1.0.0',
    });
  });

  router.get('/ready', async (_request, response) => {
    try {
      await pingDatabase();
      response.json({ status: 'ready' });
    } catch {
      response.status(503).json({ status: 'not_ready' });
    }
  });

  return router;
}
