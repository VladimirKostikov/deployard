import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isPathUnderRoots, resolveExistingPath } from './compose-project-path';

describe('compose-project-path', () => {
  it('accepts paths inside discovery roots', () => {
    const root = resolveExistingPath(import.meta.dirname);
    const nested = resolve(root, 'compose-discovery.service.ts');

    expect(isPathUnderRoots(nested, [root])).toBe(true);
  });

  it('rejects paths outside discovery roots', () => {
    expect(isPathUnderRoots('/etc/passwd', [import.meta.dirname])).toBe(false);
  });

  it('rejects traversal outside discovery roots', () => {
    const root = resolve(import.meta.dirname, 'fixtures');
    const escaped = resolve(import.meta.dirname, '../../../package.json');

    expect(isPathUnderRoots(escaped, [root])).toBe(false);
  });
});
