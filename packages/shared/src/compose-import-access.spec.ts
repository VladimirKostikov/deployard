import { describe, expect, it } from 'vitest';
import type { ComposeImportBrowserAccess } from './compose-import';
import { pickComposeImportWebAccess } from './compose-import-access';

describe('pickComposeImportWebAccess', () => {
  const entry = (
    serviceName: string,
    servicePort: number,
  ): ComposeImportBrowserAccess => ({
    serviceName,
    servicePort,
    url: `http://localhost:${31080 + servicePort}`,
    localPort: 40000 + servicePort,
  });

  it('prefers web frontend port over api', () => {
    const picked = pickComposeImportWebAccess([
      entry('todo-api', 3000),
      entry('todo-web', 80),
    ]);

    expect(picked?.serviceName).toBe('todo-web');
  });

  it('falls back to first entry when no web port', () => {
    const picked = pickComposeImportWebAccess([entry('todo-api', 3000)]);

    expect(picked?.serviceName).toBe('todo-api');
  });
});
