import { createClient } from 'redis';
import express from 'express';
import { createHealthRoutes } from './routes/health-routes.js';
import { createTodoRoutes } from './routes/todo-routes.js';
import { waitForRedis } from './wait-for-redis.js';

const port = Number(process.env.PORT ?? 3000);

async function bootstrap() {
  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST ?? 'todo-redis',
      port: Number(process.env.REDIS_PORT ?? 6379),
    },
  });

  client.on('error', (error) => {
    process.stderr.write(`${error.message}\n`);
  });

  await waitForRedis(client);
  await client.set('todo:seed', 'ready');

  const app = express();
  app.use(express.json());
  app.use(createHealthRoutes(client));
  app.use('/api', createTodoRoutes(client));

  app.listen(port, () => {
    process.stdout.write(`todo-api listening on ${port}\n`);
  });
}

bootstrap().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
