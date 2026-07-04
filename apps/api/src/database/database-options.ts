import { DataSourceOptions } from 'typeorm';
import { InitialAuthSchema1741046400000 } from './migrations/1741046400000-initial-auth-schema';
import { RevokedTokens1741046500000 } from './migrations/1741046500000-revoked-tokens';

export interface DatabaseRuntimeOptions {
  databaseUrl?: string;
  synchronize: boolean;
  migrationsRun: boolean;
  logging: boolean;
  entities?: DataSourceOptions['entities'];
}

export function resolveMigrationRun(
  synchronize: boolean,
  migrateValue: string | undefined,
): boolean {
  if (migrateValue === 'true') {
    return true;
  }

  if (migrateValue === 'false') {
    return false;
  }

  return !synchronize;
}

export function buildDatabaseOptions(options: DatabaseRuntimeOptions): DataSourceOptions {
  return {
    type: 'postgres',
    url: options.databaseUrl,
    entities: options.entities ?? [],
    migrations: [InitialAuthSchema1741046400000, RevokedTokens1741046500000],
    synchronize: options.synchronize,
    migrationsRun: options.migrationsRun,
    logging: options.logging,
  };
}
