import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildDatabaseOptions } from './database-options';
import { loadEnvFile } from './load-env-file';

loadEnvFile();

const canRunMigrationTests = Boolean(process.env.DATABASE_URL);

const AUTH_TABLES = ['users', 'roles', 'permissions', 'user_roles', 'role_permissions', 'revoked_tokens'];

function replaceDatabaseName(url: string, databaseName: string) {
  const parsed = new URL(url);
  parsed.pathname = `/${databaseName}`;
  return parsed.toString();
}

function adminConnectionUrl(url: string) {
  const parsed = new URL(url);
  parsed.pathname = '/postgres';
  return parsed.toString();
}

async function dropAuthTables(client: Client) {
  await client.query('DROP TABLE IF EXISTS "user_roles" CASCADE');
  await client.query('DROP TABLE IF EXISTS "role_permissions" CASCADE');
  await client.query('DROP TABLE IF EXISTS "revoked_tokens" CASCADE');
  await client.query('DROP TABLE IF EXISTS "users" CASCADE');
  await client.query('DROP TABLE IF EXISTS "roles" CASCADE');
  await client.query('DROP TABLE IF EXISTS "permissions" CASCADE');
  await client.query('DROP TABLE IF EXISTS "migrations" CASCADE');
}

describe.skipIf(!canRunMigrationTests)('database migrations', () => {
  const testDatabase = `dpd_migration_test_${Date.now()}`;
  let sourceDatabaseUrl = '';
  let testDatabaseUrl = '';
  let adminUrl = '';

  beforeAll(async () => {
    sourceDatabaseUrl = process.env.DATABASE_URL ?? '';
    adminUrl = adminConnectionUrl(sourceDatabaseUrl);
    testDatabaseUrl = replaceDatabaseName(sourceDatabaseUrl, testDatabase);

    const admin = new Client({ connectionString: adminUrl });
    await admin.connect();
    await admin.query(`CREATE DATABASE "${testDatabase}"`);
    await admin.end();
  });

  afterAll(async () => {
    const admin = new Client({ connectionString: adminUrl });
    await admin.connect();
    await admin.query(`DROP DATABASE IF EXISTS "${testDatabase}" WITH (FORCE)`);
    await admin.end();
  });

  it('creates auth schema on a fresh database', async () => {
    const { DataSource } = await import('typeorm');
    const dataSource = new DataSource(
      buildDatabaseOptions({
        databaseUrl: testDatabaseUrl,
        synchronize: false,
        migrationsRun: false,
        logging: false,
      }),
    );

    await dataSource.initialize();
    const executed = await dataSource.runMigrations();
    expect(executed).toHaveLength(2);
    expect(executed[0]?.name).toBe('InitialAuthSchema1741046400000');
    expect(executed[1]?.name).toBe('RevokedTokens1741046500000');

    const tables = await dataSource.query<{ tablename: string }[]>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
    );
    const names = tables.map((row) => row.tablename);

    for (const table of AUTH_TABLES) {
      expect(names).toContain(table);
    }

    expect(names).toContain('migrations');

    const secondRun = await dataSource.runMigrations();
    expect(secondRun).toHaveLength(0);

    await dataSource.destroy();
  });

  it('reverts all migrations', async () => {
    const { DataSource } = await import('typeorm');
    const dataSource = new DataSource(
      buildDatabaseOptions({
        databaseUrl: testDatabaseUrl,
        synchronize: false,
        migrationsRun: false,
        logging: false,
      }),
    );

    await dataSource.initialize();
    await dataSource.undoLastMigration();
    await dataSource.undoLastMigration();

    const tables = await dataSource.query<{ tablename: string }[]>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'migrations'`,
    );

    expect(tables).toHaveLength(0);
    await dataSource.destroy();
  });

  it('runs migrations automatically when migrationsRun is enabled', async () => {
    const client = new Client({ connectionString: testDatabaseUrl });
    await client.connect();
    await dropAuthTables(client);
    await client.end();

    const { DataSource } = await import('typeorm');
    const dataSource = new DataSource(
      buildDatabaseOptions({
        databaseUrl: testDatabaseUrl,
        synchronize: false,
        migrationsRun: true,
        logging: false,
      }),
    );

    await dataSource.initialize();

    const tables = await dataSource.query<{ tablename: string }[]>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
    );
    const names = tables.map((row) => row.tablename);

    for (const table of AUTH_TABLES) {
      expect(names).toContain(table);
    }

    await dataSource.destroy();
  });
});
