import { Router } from 'express';

export function createHealthRoutes() {
  const router = Router();

  router.get('/health', (_request, response) => {
    response.json({ status: 'ok', service: process.env.APP_NAME ?? 'weather-station' });
  });

  router.get('/ready', (_request, response) => {
    response.json({ status: 'ready' });
  });

  return router;
}
