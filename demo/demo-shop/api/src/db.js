import pg from 'pg';

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number(process.env.DATABASE_PORT ?? 5432),
      database: process.env.DATABASE_NAME ?? 'shop',
      user: process.env.DATABASE_USER ?? 'shop',
      password: process.env.DATABASE_PASSWORD ?? 'shop',
      max: 5,
    });
  }

  return pool;
}

export async function pingDatabase() {
  const client = await getPool().connect();

  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}
