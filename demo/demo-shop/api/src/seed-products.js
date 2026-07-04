const starterProducts = [
  { name: 'Wireless Mouse', price: 29.99, stock: 120 },
  { name: 'Mechanical Keyboard', price: 89.99, stock: 45 },
  { name: 'USB-C Hub', price: 49.99, stock: 80 },
  { name: 'Monitor Stand', price: 39.99, stock: 60 },
  { name: 'Webcam HD', price: 59.99, stock: 35 },
];

export async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function seedProductsIfEmpty(pool) {
  const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  const count = countResult.rows[0]?.count ?? 0;

  if (count > 0) {
    return;
  }

  for (const product of starterProducts) {
    await pool.query(
      'INSERT INTO products (name, price, stock) VALUES ($1, $2, $3)',
      [product.name, product.price, product.stock],
    );
  }
}
