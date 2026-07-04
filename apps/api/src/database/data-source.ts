import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { buildDatabaseOptions } from './database-options';
import { loadEnvFile } from './load-env-file';

loadEnvFile();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run database migrations');
}

export default new DataSource(
  buildDatabaseOptions({
    databaseUrl,
    synchronize: false,
    migrationsRun: false,
    logging: process.env.DB_LOGGING === 'true',
  }),
);
