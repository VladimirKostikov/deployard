import { describe, expect, it } from 'vitest';
import { resolveContainerRuntimeDefaults } from './deployment-container.defaults';

describe('resolveContainerRuntimeDefaults', () => {
  it('sets mysql root password env', () => {
    const defaults = resolveContainerRuntimeDefaults('mysql:8.4');
    expect(defaults.env.some((item) => item.name === 'MYSQL_ROOT_PASSWORD')).toBe(true);
  });

  it('sets postgres env', () => {
    const defaults = resolveContainerRuntimeDefaults('postgres:16-alpine');
    expect(defaults.env.some((item) => item.name === 'POSTGRES_PASSWORD')).toBe(true);
  });
});
