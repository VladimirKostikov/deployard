import { describe, expect, it } from 'vitest';
import { resolveMigrationRun } from './database-options';

describe('resolveMigrationRun', () => {
  it('defaults to false when synchronize is enabled', () => {
    expect(resolveMigrationRun(true, undefined)).toBe(false);
  });

  it('defaults to true when synchronize is disabled', () => {
    expect(resolveMigrationRun(false, undefined)).toBe(true);
  });

  it('respects explicit DB_MIGRATE=true', () => {
    expect(resolveMigrationRun(true, 'true')).toBe(true);
  });

  it('respects explicit DB_MIGRATE=false', () => {
    expect(resolveMigrationRun(false, 'false')).toBe(false);
  });
});
