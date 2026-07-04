import { randomUUID } from 'node:crypto';
import { Router } from 'express';

const listKey = 'todo:items';

async function readTodos(client) {
  const raw = await client.get(listKey);
  if (!raw) {
    return [];
  }

  return JSON.parse(raw);
}

async function writeTodos(client, items) {
  await client.set(listKey, JSON.stringify(items));
}

export function createTodoRoutes(client) {
  const router = Router();

  router.get('/todos', async (_request, response) => {
    const items = await readTodos(client);
    response.json({ items });
  });

  router.post('/todos', async (request, response) => {
    const title = String(request.body?.title ?? '').trim();
    if (!title) {
      response.status(400).json({ message: 'Title is required' });
      return;
    }

    const items = await readTodos(client);
    const item = { id: randomUUID(), title, done: false };
    items.unshift(item);
    await writeTodos(client, items);
    response.status(201).json(item);
  });

  router.patch('/todos/:id', async (request, response) => {
    const items = await readTodos(client);
    const item = items.find((entry) => entry.id === request.params.id);

    if (!item) {
      response.status(404).json({ message: 'Todo not found' });
      return;
    }

    if (typeof request.body?.done === 'boolean') {
      item.done = request.body.done;
    }

    await writeTodos(client, items);
    response.json(item);
  });

  return router;
}
