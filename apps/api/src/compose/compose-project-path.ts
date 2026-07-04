import { existsSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';

export function resolveExistingPath(path: string): string {
  if (existsSync(path)) {
    return realpathSync(path);
  }

  return resolve(path);
}

export function isPathUnderRoots(path: string, roots: string[]): boolean {
  const resolvedPath = resolveExistingPath(path);

  return roots.some((root) => {
    try {
      const resolvedRoot = realpathSync(root);
      return resolvedPath === resolvedRoot || resolvedPath.startsWith(`${resolvedRoot}/`);
    } catch {
      return false;
    }
  });
}
